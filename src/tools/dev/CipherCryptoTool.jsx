import React, { useState, useEffect, useCallback, useRef } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Lock, Unlock, Key, RefreshCw, Copy, Check,
  ShieldCheck, AlertCircle, ArrowRightLeft, ArrowRight
} from 'lucide-react';
import './CipherCryptoTool.css';

/* ============================================
   Legacy PBKDF2 Key Derivation (existing aes-gcm mode)
   ============================================ */
async function deriveAesKey(password, salt, keyLength = 256) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: keyLength },
    false,
    ['encrypt', 'decrypt']
  );
}

/* ============================================
   SHA-256 Key Derivation (.NET compatible)
   ============================================ */
async function deriveSha256Key(passphrase, keyByteLength, algoName) {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  const keyBytes = new Uint8Array(hashBuf).slice(0, keyByteLength);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: algoName },
    false,
    ['encrypt', 'decrypt']
  );
}

/* ============================================
   AES-CBC Encrypt / Decrypt (Web Crypto API)
   ============================================ */
async function encryptAesCbc(plaintext, passphrase, keyByteLength) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveSha256Key(passphrase, keyByteLength, 'AES-CBC');
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    enc.encode(plaintext)
  );
  // Pack: iv(16) + ciphertext
  const combined = new Uint8Array(16 + ciphertextBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextBuf), 16);
  return combined;
}

async function decryptAesCbc(packed, passphrase, keyByteLength) {
  if (packed.length < 17) throw new Error('Ciphertext too short (needs 16-byte IV + data).');
  const iv = packed.slice(0, 16);
  const ciphertext = packed.slice(16);
  const key = await deriveSha256Key(passphrase, keyByteLength, 'AES-CBC');
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decryptedBuf);
}

/* ============================================
   AES-GCM Encrypt / Decrypt (Web Crypto API)
   12-byte nonce, 128-bit auth tag (appended by WebCrypto)
   ============================================ */
async function encryptAesGcmNew(plaintext, passphrase, keyByteLength) {
  const enc = new TextEncoder();
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveSha256Key(passphrase, keyByteLength, 'AES-GCM');
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    key,
    enc.encode(plaintext)
  );
  // Pack: nonce(12) + ciphertext+tag
  const combined = new Uint8Array(12 + ciphertextBuf.byteLength);
  combined.set(nonce, 0);
  combined.set(new Uint8Array(ciphertextBuf), 12);
  return combined;
}

async function decryptAesGcmNew(packed, passphrase, keyByteLength) {
  if (packed.length < 13) throw new Error('Ciphertext too short (needs 12-byte nonce + data + 16-byte tag).');
  const nonce = packed.slice(0, 12);
  const ciphertextWithTag = packed.slice(12);
  const key = await deriveSha256Key(passphrase, keyByteLength, 'AES-GCM');
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    key,
    ciphertextWithTag
  );
  return new TextDecoder().decode(decryptedBuf);
}

/* ============================================
   Binary <-> Encoding Helpers
   ============================================ */
function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBuf(hexStr) {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  return bytes;
}
function bufToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToBuf(b64) {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* ============================================
   Classic Cipher Helpers (unchanged)
   ============================================ */
function xorBytes(inputBytes, keyStr) {
  const result = new Uint8Array(inputBytes.length);
  for (let i = 0; i < inputBytes.length; i++) result[i] = inputBytes[i] ^ keyStr.charCodeAt(i % keyStr.length);
  return result;
}
function rc4Bytes(inputBytes, keyStr) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i2 = 0, j2 = 0;
  const result = new Uint8Array(inputBytes.length);
  for (let k = 0; k < inputBytes.length; k++) {
    i2 = (i2 + 1) % 256;
    j2 = (j2 + s[i2]) % 256;
    [s[i2], s[j2]] = [s[j2], s[i2]];
    result[k] = inputBytes[k] ^ s[(s[i2] + s[j2]) % 256];
  }
  return result;
}
function caesarText(text, shift, isDecrypt) {
  const effShift = isDecrypt ? (26 - (shift % 26)) % 26 : shift % 26;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + effShift) % 26) + base);
  });
}
function rot13Text(text) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/* ============================================
   Algorithm metadata
   ============================================ */
const AES_NEW_ALGOS = ['aes-128-cbc', 'aes-256-cbc', 'aes-128-gcm', 'aes-256-gcm'];
const AES_LEGACY_ALGOS = ['aes-gcm', 'aem-crypto'];

function getAesParams(algo) {
  switch (algo) {
    case 'aes-128-cbc': return { mode: 'CBC', keyBytes: 16, bits: 128 };
    case 'aes-256-cbc': return { mode: 'CBC', keyBytes: 32, bits: 256 };
    case 'aes-128-gcm': return { mode: 'GCM', keyBytes: 16, bits: 128 };
    case 'aes-256-gcm': return { mode: 'GCM', keyBytes: 32, bits: 256 };
    default: return null;
  }
}

function getStatusLabel(algo) {
  const params = getAesParams(algo);
  if (!params) return null;
  const pad = params.mode === 'CBC' ? ' · PKCS7' : ' · Authenticated';
  return `AES-${params.bits}-${params.mode}${pad} · SHA-256 Key`;
}

/* ============================================
   CipherCryptoTool Component
   ============================================ */
const CipherCryptoTool = () => {
  const { showToast } = useApp();
  const [algorithm, setAlgorithm] = useState('aes-256-cbc');
  const [mode, setMode] = useState('encrypt');
  const [key, setKey] = useState('');
  const [outputFormat, setOutputFormat] = useState('base64');
  const [plainInput, setPlainInput] = useState('Welcome to DevWizard Secure Cryptography Studio.');
  const [cipherInput, setCipherInput] = useState('');
  const [status, setStatus] = useState({ valid: true, message: 'Ready — enter an encryption key to begin' });
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  const isNewAes = AES_NEW_ALGOS.includes(algorithm);
  const isLegacyAes = AES_LEGACY_ALGOS.includes(algorithm);
  const isClassic = ['rot13', 'caesar', 'xor', 'rc4'].includes(algorithm);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const len = isNewAes ? (getAesParams(algorithm)?.bits === 256 ? 32 : 16) : 24;
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    setKey(Array.from(array, x => chars[x % chars.length]).join(''));
    showToast(`Generated secure ${len}-char key`, 'info');
  };

  /* ---- Encrypt ---- */
  const executeEncrypt = useCallback(async (text, pass, algo, fmt) => {
    if (!text.trim()) { setCipherInput(''); setStatus({ valid: true, message: 'Ready' }); return; }
    try {
      const enc = new TextEncoder();
      const inputBytes = enc.encode(text);
      const keyStr = pass || 'key';

      // Classic ciphers (unchanged)
      if (algo === 'rot13') { setCipherInput(rot13Text(text)); setStatus({ valid: true, message: 'ROT13 applied (symmetric)' }); return; }
      if (algo === 'caesar') {
        const shift = parseInt(keyStr, 10) || 3;
        setCipherInput(caesarText(text, shift, false));
        setStatus({ valid: true, message: `Caesar +${shift} shift` });
        return;
      }
      if (algo === 'xor') {
        const bytes = xorBytes(inputBytes, keyStr);
        setCipherInput(fmt === 'hex' ? bufToHex(bytes) : bufToBase64(bytes));
        setStatus({ valid: true, message: 'XOR encrypted successfully' });
        return;
      }
      if (algo === 'rc4') {
        const bytes = rc4Bytes(inputBytes, keyStr);
        setCipherInput(fmt === 'hex' ? bufToHex(bytes) : bufToBase64(bytes));
        setStatus({ valid: true, message: 'RC4 encrypted successfully' });
        return;
      }

      // New AES modes (SHA-256 key derivation)
      const aesParams = getAesParams(algo);
      if (aesParams) {
        if (!pass) { setCipherInput(''); setStatus({ valid: false, message: 'Encryption key is required' }); return; }
        let combined;
        if (aesParams.mode === 'CBC') {
          combined = await encryptAesCbc(text, pass, aesParams.keyBytes);
        } else {
          combined = await encryptAesGcmNew(text, pass, aesParams.keyBytes);
        }
        const result = fmt === 'hex' ? bufToHex(combined) : bufToBase64(combined);
        setCipherInput(result);
        setStatus({ valid: true, message: `${getStatusLabel(algo)} — encrypted` });
        return;
      }

      // Legacy AES-GCM (PBKDF2) — unchanged
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv   = crypto.getRandomValues(new Uint8Array(12));
      const derivedKey = await deriveAesKey(pass, salt, 256);
      const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, inputBytes);

      const combined = new Uint8Array(16 + 12 + ciphertextBuf.byteLength);
      combined.set(salt, 0); combined.set(iv, 16); combined.set(new Uint8Array(ciphertextBuf), 28);

      let result = fmt === 'hex' ? bufToHex(combined) : bufToBase64(combined);
      if (algo === 'aem-crypto') result = `{aem-crypto}${result}`;

      setCipherInput(result);
      setStatus({ valid: true, message: 'AES-GCM 256-bit encrypted (PBKDF2 SHA-256)' });
    } catch (err) {
      setCipherInput('');
      setStatus({ valid: false, message: `Encryption error: ${err.message}` });
    }
  }, []);

  /* ---- Decrypt ---- */
  const executeDecrypt = useCallback(async (cipherText, pass, algo, fmt) => {
    if (!cipherText.trim()) { setPlainInput(''); setStatus({ valid: true, message: 'Ready' }); return; }
    try {
      const keyStr = pass || 'key';

      // Classic ciphers (unchanged)
      if (algo === 'rot13') { setPlainInput(rot13Text(cipherText)); setStatus({ valid: true, message: 'ROT13 reversed' }); return; }
      if (algo === 'caesar') {
        const shift = parseInt(keyStr, 10) || 3;
        setPlainInput(caesarText(cipherText, shift, true));
        setStatus({ valid: true, message: `Caesar -${shift} decrypted` });
        return;
      }
      if (algo === 'xor') {
        const inputBytes = fmt === 'hex' ? hexToBuf(cipherText) : base64ToBuf(cipherText);
        setPlainInput(new TextDecoder().decode(xorBytes(inputBytes, keyStr)));
        setStatus({ valid: true, message: 'XOR decrypted successfully' });
        return;
      }
      if (algo === 'rc4') {
        const inputBytes = fmt === 'hex' ? hexToBuf(cipherText) : base64ToBuf(cipherText);
        setPlainInput(new TextDecoder().decode(rc4Bytes(inputBytes, keyStr)));
        setStatus({ valid: true, message: 'RC4 decrypted successfully' });
        return;
      }

      // New AES modes (SHA-256 key derivation)
      const aesParams = getAesParams(algo);
      if (aesParams) {
        if (!pass) { setPlainInput(''); setStatus({ valid: false, message: 'Encryption key is required' }); return; }
        const packed = fmt === 'hex' ? hexToBuf(cipherText.trim()) : base64ToBuf(cipherText.trim());
        let plaintext;
        if (aesParams.mode === 'CBC') {
          plaintext = await decryptAesCbc(packed, pass, aesParams.keyBytes);
        } else {
          plaintext = await decryptAesGcmNew(packed, pass, aesParams.keyBytes);
        }
        setPlainInput(plaintext);
        setStatus({ valid: true, message: `${getStatusLabel(algo)} — decrypted` });
        return;
      }

      // Legacy AES-GCM (PBKDF2) — unchanged
      let clean = cipherText.trim();
      if (clean.startsWith('{') && clean.includes('}')) clean = clean.substring(clean.indexOf('}') + 1).trim();

      const combined = fmt === 'hex' ? hexToBuf(clean) : base64ToBuf(clean);
      if (combined.length < 28) throw new Error('Ciphertext too short (needs 16-byte salt + 12-byte IV).');

      const salt       = combined.slice(0, 16);
      const iv         = combined.slice(16, 28);
      const ciphertext = combined.slice(28);
      const derivedKey = await deriveAesKey(pass, salt, 256);
      const decryptedBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derivedKey, ciphertext);
      setPlainInput(new TextDecoder().decode(decryptedBuf));
      setStatus({ valid: true, message: 'AES-GCM decrypted successfully' });
    } catch (err) {
      setPlainInput('');
      const isAuthFail = err.message?.includes('decrypt') || err.name === 'OperationError';
      const msg = isAuthFail
        ? 'Decryption failed — wrong key, corrupted data, or authentication failure.'
        : `Decryption failed — ${err.message}`;
      setStatus({ valid: false, message: msg });
    }
  }, []);

  /* ---- Auto-execute on input change ---- */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mode === 'encrypt') executeEncrypt(plainInput, key, algorithm, outputFormat);
      else executeDecrypt(cipherInput, key, algorithm, outputFormat);
    }, 320);
    return () => clearTimeout(debounceRef.current);
  }, [plainInput, cipherInput, key, algorithm, mode, outputFormat, executeEncrypt, executeDecrypt]);

  /* ---- Copy ---- */
  const copyOutput = () => {
    const text = mode === 'encrypt' ? cipherInput : plainInput;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  /* ---- Status bar label ---- */
  const statusRightLabel = (() => {
    if (isNewAes) {
      const p = getAesParams(algorithm);
      return `AES-${p.bits}-${p.mode} · SHA-256 · ${p.mode === 'CBC' ? 'PKCS7' : 'Auth Tag'} · ${outputFormat.toUpperCase()}`;
    }
    if (isLegacyAes) return `AES-GCM · PBKDF2 · ${outputFormat.toUpperCase()}`;
    return `${algorithm.toUpperCase()} · Classic · ${outputFormat.toUpperCase()}`;
  })();

  /* ---- Toolbar ---- */
  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-btn-group">
        <button className={`dw-btn dw-btn-sm ${mode === 'encrypt' ? 'dw-btn-primary' : 'dw-btn-secondary'}`} onClick={() => setMode('encrypt')}>
          <Lock size={12} /><span>Encrypt</span>
        </button>
        <button className={`dw-btn dw-btn-sm ${mode === 'decrypt' ? 'dw-btn-primary' : 'dw-btn-secondary'}`} onClick={() => setMode('decrypt')}>
          <Unlock size={12} /><span>Decrypt</span>
        </button>
      </div>
      <button className="dw-btn dw-btn-secondary dw-btn-sm" onClick={() => setMode(m => m === 'encrypt' ? 'decrypt' : 'encrypt')}>
        <ArrowRightLeft size={12} /><span>Swap Mode</span>
      </button>
      <div style={{ marginLeft: 'auto' }}>
        <button className="dw-btn dw-btn-primary dw-btn-sm" onClick={copyOutput}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>Copy {mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <ToolWorkspace
      toolId="cipher-crypto"
      singlePanel={true}
      toolbar={toolbar}
      statusLeft={
        status.valid ? (
          <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> {status.message}
          </span>
        ) : (
          <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> {status.message}
          </span>
        )
      }
      statusRight={<span>{statusRightLabel}</span>}
    >
      <div className="cipher-container">
        <div className="cipher-config-bar">
          <div className="cipher-config-item">
            <span>Algorithm:</span>
            <select className="cipher-select" value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <optgroup label="AES — Backend Compatible (SHA-256 Key)">
                <option value="aes-128-cbc">AES-128-CBC (PKCS7)</option>
                <option value="aes-256-cbc">AES-256-CBC (PKCS7)</option>
                <option value="aes-128-gcm">AES-128-GCM (Authenticated)</option>
                <option value="aes-256-gcm">AES-256-GCM (Authenticated)</option>
              </optgroup>
              <optgroup label="AES — PBKDF2 (Legacy)">
                <option value="aes-gcm">AES-GCM 256-bit (PBKDF2)</option>
                <option value="aem-crypto">Adobe AEM CryptoSupport</option>
              </optgroup>
              <optgroup label="Stream and Classic Ciphers">
                <option value="rc4">RC4 Stream Cipher</option>
                <option value="xor">XOR Multi-byte Key</option>
                <option value="caesar">Caesar Shift Cipher</option>
                <option value="rot13">ROT13 (Symmetric)</option>
              </optgroup>
            </select>
          </div>

          {isNewAes && (
            <div className="cipher-config-item">
              <span className="cipher-key-size-badge" data-bits={getAesParams(algorithm)?.bits}>
                {getAesParams(algorithm)?.bits}-bit · {getAesParams(algorithm)?.mode}
              </span>
            </div>
          )}

          <div className="cipher-config-item">
            <Key size={13} />
            <span>{algorithm === 'caesar' ? 'Shift Amount:' : isNewAes ? 'Encryption Key:' : 'Passphrase / Key:'}</span>
            <input
              type="password"
              className="cipher-input-key"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder={
                algorithm === 'caesar'
                  ? 'Shift number (e.g. 3)'
                  : isNewAes
                    ? 'Enter your encryption key...'
                    : 'Encryption passphrase...'
              }
              spellCheck={false}
              autoComplete="off"
            />
            {algorithm !== 'rot13' && (
              <button className="dw-btn dw-btn-ghost dw-btn-sm" onClick={generateRandomKey} title="Generate random key">
                <RefreshCw size={12} />
              </button>
            )}
          </div>
          {(algorithm === 'xor' || algorithm === 'rc4' || !isClassic) && (
            <div className="cipher-config-item">
              <span>Output Encoding:</span>
              <select className="cipher-select" value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
                <option value="base64">Base64</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
          )}
        </div>

        <div className="cipher-views-row">
          <div className="cipher-view-pane cipher-pane-left">
            <div className={`cipher-pane-header ${mode === 'encrypt' ? 'cipher-header-active' : ''}`}>
              <span>Plaintext {mode === 'encrypt' ? '(INPUT)' : '(OUTPUT)'}</span>
              <span className="cipher-meta-badge">{plainInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea"
              value={plainInput}
              onChange={e => { setPlainInput(e.target.value); if (mode !== 'encrypt') setMode('encrypt'); }}
              placeholder="Type or paste plaintext here..."
              spellCheck={false}
              readOnly={mode === 'decrypt'}
            />
          </div>

          <div className="cipher-direction-badge">
            <ArrowRight
              size={18}
              style={{
                color: mode === 'encrypt' ? 'var(--accent-primary)' : 'var(--accent-warning)',
                transform: mode === 'decrypt' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease, color 0.2s ease'
              }}
            />
            <span className="cipher-dir-label">{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
          </div>

          <div className="cipher-view-pane cipher-pane-right">
            <div className={`cipher-pane-header ${mode === 'decrypt' ? 'cipher-header-active' : ''}`}>
              <span>Ciphertext {mode === 'decrypt' ? '(INPUT)' : '(OUTPUT)'}</span>
              <span className="cipher-meta-badge">{cipherInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea cipher-textarea-cipher"
              value={cipherInput}
              onChange={e => { setCipherInput(e.target.value); if (mode !== 'decrypt') setMode('decrypt'); }}
              placeholder={`Paste ${outputFormat} ciphertext here to decrypt...`}
              spellCheck={false}
              readOnly={mode === 'encrypt'}
            />
          </div>
        </div>

        <div className="cipher-hint-bar">
          {mode === 'encrypt'
            ? 'Encrypt mode: type plaintext on the left. Copy ciphertext from the right. Switch to Decrypt mode and paste it back to verify.'
            : 'Decrypt mode: paste ciphertext on the right with the same key. Plaintext will appear on the left.'}
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default CipherCryptoTool;