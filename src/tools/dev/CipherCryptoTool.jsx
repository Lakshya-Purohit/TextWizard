import React, { useState, useEffect, useCallback } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Lock, Unlock, Key, RefreshCw, Copy, Check,
  ShieldCheck, AlertCircle, ArrowLeftRight
} from 'lucide-react';
import './CipherCryptoTool.css';

// WebCrypto helper: Derive AES key from password + salt via PBKDF2
async function deriveAesKey(password, salt, keyLength = 256) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: keyLength },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to Hex string
function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBuf(hexStr) {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
  }
  return bytes;
}

// Convert ArrayBuffer to Base64
function bufToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuf(b64) {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Classic Ciphers (Caesar, ROT13, XOR, RC4)
function runClassicCipher(text, algo, key, isDecrypt) {
  if (algo === 'rot13') {
    return text.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  if (algo === 'caesar') {
    const shift = parseInt(key, 10) || 3;
    const effShift = isDecrypt ? (26 - (shift % 26)) % 26 : shift % 26;
    return text.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + effShift) % 26) + base);
    });
  }

  if (algo === 'xor') {
    const keyStr = key || 'secretKey';
    let res = '';
    for (let i = 0; i < text.length; i++) {
      res += String.fromCharCode(text.charCodeAt(i) ^ keyStr.charCodeAt(i % keyStr.length));
    }
    return res;
  }

  if (algo === 'rc4') {
    const keyStr = key || 'secretKey';
    const s = [];
    for (let i = 0; i < 256; i++) s[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + keyStr.charCodeAt(i % keyStr.length)) % 256;
      [s[i], s[j]] = [s[j], s[i]];
    }
    let i = 0;
    j = 0;
    let res = '';
    for (let k = 0; k < text.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      [s[i], s[j]] = [s[j], s[i]];
      const prng = s[(s[i] + s[j]) % 256];
      res += String.fromCharCode(text.charCodeAt(k) ^ prng);
    }
    return res;
  }

  return text;
}

const CipherCryptoTool = () => {
  const { showToast } = useApp();
  const [algorithm, setAlgorithm] = useState('aes-gcm'); // 'aes-gcm' | 'aem-crypto' | 'aes-cbc' | 'rot13' | 'caesar' | 'xor' | 'rc4'
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [key, setKey] = useState('devwizard-secret-passphrase-2026');
  const [outputFormat, setOutputFormat] = useState('base64'); // 'base64' | 'hex'
  const [plainInput, setPlainInput] = useState('Welcome to DevWizard Secure Cryptography Studio. Confidential data protection.');
  const [cipherInput, setCipherInput] = useState('');
  const [status, setStatus] = useState({ valid: true, message: '' });
  const [copied, setCopied] = useState(false);

  // Generate random strong passphrase
  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    const array = new Uint32Array(24);
    crypto.getRandomValues(array);
    const newKey = Array.from(array, x => chars[x % chars.length]).join('');
    setKey(newKey);
    showToast('Generated secure 24-char cryptographic key', 'info');
  };

  // Perform Encryption
  const executeEncrypt = useCallback(async (text, pass, algo, format) => {
    if (!text.trim()) {
      setCipherInput('');
      setStatus({ valid: true, message: '' });
      return;
    }

    try {
      if (algo === 'rot13' || algo === 'caesar' || algo === 'xor' || algo === 'rc4') {
        const out = runClassicCipher(text, algo, pass, false);
        setCipherInput(format === 'hex' ? bufToHex(new TextEncoder().encode(out)) : out);
        setStatus({ valid: true, message: `${algo.toUpperCase()} Encrypted` });
        return;
      }

      // AES-GCM or AEM Crypto
      const enc = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
      const derivedKey = await deriveAesKey(pass, salt, 256);

      const ciphertextBuf = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        enc.encode(text)
      );

      // Package: [16 bytes salt] + [12 bytes IV] + [ciphertext + tag]
      const combined = new Uint8Array(salt.length + iv.length + ciphertextBuf.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(ciphertextBuf), salt.length + iv.length);

      let resultString = format === 'hex' ? bufToHex(combined) : bufToBase64(combined);

      if (algo === 'aem-crypto') {
        // AEM (Adobe Experience Manager) standard token format: {aem-crypto}<base64-payload>
        resultString = `{aem-crypto}${resultString}`;
      }

      setCipherInput(resultString);
      setStatus({ valid: true, message: `Encrypted using ${algo.toUpperCase()}` });
    } catch (err) {
      setCipherInput('');
      setStatus({ valid: false, message: `Encryption error: ${err.message}` });
    }
  }, []);

  // Perform Decryption
  const executeDecrypt = useCallback(async (cipherText, pass, algo, format) => {
    if (!cipherText.trim()) {
      setPlainInput('');
      setStatus({ valid: true, message: '' });
      return;
    }

    try {
      if (algo === 'rot13' || algo === 'caesar' || algo === 'xor' || algo === 'rc4') {
        const inputStr = format === 'hex' ? new TextDecoder().decode(hexToBuf(cipherText)) : cipherText;
        const out = runClassicCipher(inputStr, algo, pass, true);
        setPlainInput(out);
        setStatus({ valid: true, message: `${algo.toUpperCase()} Decrypted` });
        return;
      }

      // Handle AEM prefix {aem-crypto}... or {...}...
      let cleanCipher = cipherText.trim();
      if (cleanCipher.startsWith('{') && cleanCipher.includes('}')) {
        const closeIdx = cleanCipher.indexOf('}');
        cleanCipher = cleanCipher.substring(closeIdx + 1).trim();
      }

      const combined = format === 'hex' ? hexToBuf(cleanCipher) : base64ToBuf(cleanCipher);
      if (combined.length < 28) {
        throw new Error('Ciphertext is too short to contain required cryptographic salt and IV.');
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);

      const derivedKey = await deriveAesKey(pass, salt, 256);
      const decryptedBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        ciphertext
      );

      const dec = new TextDecoder();
      const plain = dec.decode(decryptedBuf);
      setPlainInput(plain);
      setStatus({ valid: true, message: `Decrypted with ${algo.toUpperCase()}` });
    } catch (err) {
      setPlainInput('');
      setStatus({ valid: false, message: `Decryption failed: Incorrect key or corrupted ciphertext.` });
    }
  }, []);

  // Trigger on changes
  useEffect(() => {
    if (mode === 'encrypt') {
      executeEncrypt(plainInput, key, algorithm, outputFormat);
    } else {
      executeDecrypt(cipherInput, key, algorithm, outputFormat);
    }
  }, [plainInput, cipherInput, key, algorithm, mode, outputFormat, executeEncrypt, executeDecrypt]);

  const handleSwap = () => {
    if (mode === 'encrypt') {
      setMode('decrypt');
    } else {
      setMode('encrypt');
    }
  };

  const copyOutput = () => {
    const textToCopy = mode === 'encrypt' ? cipherInput : plainInput;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(`Copied ${mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
        <button
          className={`dw-tab ${mode === 'encrypt' ? 'active' : ''}`}
          onClick={() => setMode('encrypt')}
        >
          <Lock size={12} />
          <span>Encrypt</span>
        </button>
        <button
          className={`dw-tab ${mode === 'decrypt' ? 'active' : ''}`}
          onClick={() => setMode('decrypt')}
        >
          <Unlock size={12} />
          <span>Decrypt</span>
        </button>
      </div>

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={handleSwap}
        title="Swap encrypt / decrypt"
      >
        <ArrowLeftRight size={12} />
        <span>Swap</span>
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className="dw-btn dw-btn-primary dw-btn-sm"
          onClick={copyOutput}
          title="Copy result"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>Copy Result</span>
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
            <ShieldCheck size={12} /> {status.message || 'Ready'}
          </span>
        ) : (
          <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> {status.message}
          </span>
        )
      }
      statusRight={
        <span>
          Algorithm: <strong>{algorithm.toUpperCase()}</strong> • PBKDF2 SHA-256
        </span>
      }
    >
      <div className="cipher-container">
        {/* Configuration Bar */}
        <div className="cipher-config-bar">
          <div className="cipher-config-item">
            <span>Algorithm:</span>
            <select
              className="cipher-select"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <optgroup label="Modern Cryptography">
                <option value="aes-gcm">AES-GCM (Authenticated 256-bit)</option>
                <option value="aem-crypto">Adobe AEM CryptoSupport ({'{aem-crypto}...'})</option>
              </optgroup>
              <optgroup label="Stream & Classic Ciphers">
                <option value="rc4">RC4 Stream Cipher</option>
                <option value="xor">XOR Multi-byte Key Cipher</option>
                <option value="caesar">Caesar Shift Cipher</option>
                <option value="rot13">ROT13 Cipher</option>
              </optgroup>
            </select>
          </div>

          <div className="cipher-config-item">
            <Key size={13} />
            <span>Passphrase / Key:</span>
            <input
              type="text"
              className="cipher-input-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Encryption passphrase..."
              spellCheck={false}
            />
            <button
              className="dw-btn dw-btn-ghost dw-btn-sm"
              onClick={generateRandomKey}
              title="Generate random 24-char cryptographic key"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="cipher-config-item">
            <span>Encoding:</span>
            <select
              className="cipher-select"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            >
              <option value="base64">Base64</option>
              <option value="hex">Hexadecimal</option>
            </select>
          </div>
        </div>

        {/* Dual Input/Output Views */}
        <div className="cipher-views-row">
          {/* Left Pane: Plaintext */}
          <div className="cipher-view-pane cipher-pane-left">
            <div className="cipher-pane-header">
              <span>Plaintext {mode === 'encrypt' ? '(Input)' : '(Decrypted Output)'}</span>
              <span className="cipher-meta-badge">{plainInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea"
              value={plainInput}
              onChange={(e) => {
                setPlainInput(e.target.value);
                if (mode === 'decrypt') setMode('encrypt');
              }}
              placeholder="Type or paste plaintext here..."
              spellCheck={false}
              readOnly={mode === 'decrypt'}
            />
          </div>

          {/* Right Pane: Ciphertext */}
          <div className="cipher-view-pane cipher-pane-right">
            <div className="cipher-pane-header">
              <span>Ciphertext {mode === 'decrypt' ? '(Input)' : '(Encrypted Output)'}</span>
              <span className="cipher-meta-badge">{cipherInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea"
              value={cipherInput}
              onChange={(e) => {
                setCipherInput(e.target.value);
                if (mode === 'encrypt') setMode('decrypt');
              }}
              placeholder="Encrypted ciphertext (Base64 / Hex)..."
              spellCheck={false}
              readOnly={mode === 'encrypt'}
              style={{ color: 'var(--text-code)', letterSpacing: '0.04em' }}
            />
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default CipherCryptoTool;
