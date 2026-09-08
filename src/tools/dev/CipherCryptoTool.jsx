import React, { useState, useEffect, useCallback, useRef } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Lock, Unlock, Key, RefreshCw, Copy, Check,
  ShieldCheck, AlertCircle, ArrowRightLeft, ArrowRight,
  Sliders, Hash
} from 'lucide-react';
import CodeSnippetsPanel from '../../components/CodeSnippetsPanel';
import './CipherCryptoTool.css';

/* ============================================================
   Key Derivation Functions
   ============================================================ */

/**
 * .NET & AngularJS Compatible Key Derivation:
 * SHA-256(passphrase) -> Hex string -> substring(0, length) -> Latin1/ASCII bytes
 */
async function deriveDotNetSha256Key(passphrase, keyByteLength, algoName) {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  const hexHash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const keySubstring = hexHash.substring(0, keyByteLength);
  const keyBytes = new Uint8Array(keyByteLength);
  for (let i = 0; i < keyByteLength; i++) {
    keyBytes[i] = keySubstring.charCodeAt(i);
  }
  return crypto.subtle.importKey('raw', keyBytes, { name: algoName }, false, ['encrypt', 'decrypt']);
}

/**
 * Direct Raw SHA-256 Digest Key Derivation:
 * Uses the first 16 or 32 raw bytes of SHA-256(passphrase)
 */
async function deriveRawSha256Key(passphrase, keyByteLength, algoName) {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  const keyBytes = new Uint8Array(hashBuf).slice(0, keyByteLength);
  return crypto.subtle.importKey('raw', keyBytes, { name: algoName }, false, ['encrypt', 'decrypt']);
}

/**
 * Legacy PBKDF2 Key Derivation (100,000 rounds)
 */
async function derivePbkdf2Key(password, salt, keyLength = 256) {
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

/* ============================================================
   Byte / Encoding Helpers
   ============================================================ */
function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hexStr) {
  const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bufToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64) {
  const clean = b64.trim().replace(/[\r\n\s]/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function generateRandomHex(byteLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return bufToHex(bytes);
}

/* ============================================================
   Classic Ciphers
   ============================================================ */
function xorBytes(inputBytes, keyStr) {
  const result = new Uint8Array(inputBytes.length);
  const kLen = keyStr.length || 1;
  for (let i = 0; i < inputBytes.length; i++) {
    result[i] = inputBytes[i] ^ keyStr.charCodeAt(i % kLen);
  }
  return result;
}

function rc4Bytes(inputBytes, keyStr) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  const kLen = keyStr.length || 1;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyStr.charCodeAt(i % kLen)) % 256;
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

/* ============================================================
   Algorithm Definitions
   ============================================================ */
const ALGORITHMS = {
  'aes-128-cbc': { name: 'AES-128-CBC', mode: 'CBC', keyBytes: 16, bits: 128, ivBytes: 16, isAes: true },
  'aes-256-cbc': { name: 'AES-256-CBC', mode: 'CBC', keyBytes: 32, bits: 256, ivBytes: 16, isAes: true },
  'aes-128-gcm': { name: 'AES-128-GCM', mode: 'GCM', keyBytes: 16, bits: 128, ivBytes: 12, isAes: true },
  'aes-256-gcm': { name: 'AES-256-GCM', mode: 'GCM', keyBytes: 32, bits: 256, ivBytes: 12, isAes: true },
  'aes-gcm-pbkdf2': { name: 'AES-GCM 256 (PBKDF2)', mode: 'GCM', keyBytes: 32, bits: 256, isLegacy: true },
  'aem-crypto': { name: 'Adobe AEM CryptoSupport', mode: 'GCM', keyBytes: 32, bits: 256, isLegacy: true },
  'rc4': { name: 'RC4 Stream Cipher', isClassic: true },
  'xor': { name: 'XOR Multi-byte Key', isClassic: true },
  'caesar': { name: 'Caesar Shift Cipher', isClassic: true },
  'rot13': { name: 'ROT13 (Symmetric)', isClassic: true }
};

/* ============================================================
   Main Component
   ============================================================ */
const CipherCryptoTool = () => {
  const { showToast } = useApp();
  const [algorithm, setAlgorithm] = useState('aes-256-cbc');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [key, setKey] = useState('DevWizard-Secret-Key-2026');
  const [iv, setIv] = useState('');
  const [keyDerivation, setKeyDerivation] = useState('dotnet'); // 'dotnet' | 'raw'
  const [outputFormat, setOutputFormat] = useState('json'); // 'json' | 'base64' | 'hex'
  const [plainInput, setPlainInput] = useState('{\n  "message": "Secure payload encrypted client-side with DevWizard",\n  "status": "confidential",\n  "timestamp": 2026\n}');
  const [cipherInput, setCipherInput] = useState('');
  const [status, setStatus] = useState({ valid: true, message: 'Ready' });
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  const currentAlgo = ALGORITHMS[algorithm] || ALGORITHMS['aes-256-cbc'];
  const isAes = currentAlgo.isAes;
  const isClassic = currentAlgo.isClassic;

  // Initialize random IV for AES on mount or algorithm change
  useEffect(() => {
    if (isAes && !iv) {
      setIv(generateRandomHex(currentAlgo.ivBytes));
    }
  }, [isAes, currentAlgo.ivBytes, iv]);

  const handleRegenerateIv = () => {
    if (isAes) {
      const newIv = generateRandomHex(currentAlgo.ivBytes);
      setIv(newIv);
      showToast(`Generated new ${currentAlgo.ivBytes * 8}-bit IV / Nonce`, 'info');
    }
  };

  const handleGenerateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    const len = currentAlgo.bits === 128 ? 16 : 32;
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    const newKey = Array.from(array, x => chars[x % chars.length]).join('');
    setKey(newKey);
    showToast(`Generated secure ${len}-char key`, 'info');
  };

  /* ============================================================
     Execute Encryption
     ============================================================ */
  const executeEncrypt = useCallback(async (text, pass, algoKey, ivStr, kDeriv, fmt) => {
    if (!text.trim()) {
      setCipherInput('');
      setStatus({ valid: true, message: 'Ready — waiting for input' });
      return;
    }

    const algo = ALGORITHMS[algoKey] || ALGORITHMS['aes-256-cbc'];

    try {
      const enc = new TextEncoder();
      const inputBytes = enc.encode(text);

      // --- Classic Ciphers ---
      if (algo.isClassic) {
        const keyStr = pass || 'key';
        if (algoKey === 'rot13') {
          setCipherInput(rot13Text(text));
          setStatus({ valid: true, message: 'ROT13 applied (symmetric rotation)' });
          return;
        }
        if (algoKey === 'caesar') {
          const shift = parseInt(keyStr, 10) || 3;
          setCipherInput(caesarText(text, shift, false));
          setStatus({ valid: true, message: `Caesar +${shift} shift applied` });
          return;
        }
        if (algoKey === 'xor') {
          const bytes = xorBytes(inputBytes, keyStr);
          setCipherInput(fmt === 'hex' ? bufToHex(bytes) : bufToBase64(bytes));
          setStatus({ valid: true, message: 'XOR encrypted with multi-byte key' });
          return;
        }
        if (algoKey === 'rc4') {
          const bytes = rc4Bytes(inputBytes, keyStr);
          setCipherInput(fmt === 'hex' ? bufToHex(bytes) : bufToBase64(bytes));
          setStatus({ valid: true, message: 'RC4 stream encrypted successfully' });
          return;
        }
      }

      // --- Legacy PBKDF2 AES-GCM ---
      if (algo.isLegacy) {
        if (!pass) {
          setStatus({ valid: false, message: 'Passphrase is required for encryption' });
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const ivBytes = crypto.getRandomValues(new Uint8Array(12));
        const derivedKey = await derivePbkdf2Key(pass, salt, 256);
        const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBytes }, derivedKey, inputBytes);

        const combined = new Uint8Array(16 + 12 + ciphertextBuf.byteLength);
        combined.set(salt, 0);
        combined.set(ivBytes, 16);
        combined.set(new Uint8Array(ciphertextBuf), 28);

        let result = fmt === 'hex' ? bufToHex(combined) : bufToBase64(combined);
        if (algoKey === 'aem-crypto') result = `{aem-crypto}${result}`;

        setCipherInput(result);
        setStatus({ valid: true, message: 'AES-GCM 256-bit encrypted (PBKDF2 100k rounds)' });
        return;
      }

      // --- Modern AES (CBC / GCM) ---
      if (!pass) {
        setStatus({ valid: false, message: 'Encryption key is required' });
        return;
      }

      // Derive Key
      const keyObj = kDeriv === 'dotnet'
        ? await deriveDotNetSha256Key(pass, algo.keyBytes, algo.mode === 'CBC' ? 'AES-CBC' : 'AES-GCM')
        : await deriveRawSha256Key(pass, algo.keyBytes, algo.mode === 'CBC' ? 'AES-CBC' : 'AES-GCM');

      // Resolve IV / Nonce
      let ivBytes;
      if (ivStr && ivStr.trim()) {
        const cleanIv = ivStr.trim();
        // If hex string of right length
        if (/^[0-9a-fA-F]+$/.test(cleanIv) && cleanIv.length === algo.ivBytes * 2) {
          ivBytes = hexToBuf(cleanIv);
        } else {
          // Fallback to ASCII characters
          ivBytes = new Uint8Array(algo.ivBytes);
          for (let i = 0; i < algo.ivBytes; i++) {
            ivBytes[i] = i < cleanIv.length ? cleanIv.charCodeAt(i) : 0;
          }
        }
      } else {
        ivBytes = crypto.getRandomValues(new Uint8Array(algo.ivBytes));
        setIv(bufToHex(ivBytes));
      }

      let ciphertextBuf;
      if (algo.mode === 'CBC') {
        ciphertextBuf = await crypto.subtle.encrypt(
          { name: 'AES-CBC', iv: ivBytes },
          keyObj,
          inputBytes
        );
      } else {
        ciphertextBuf = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
          keyObj,
          inputBytes
        );
      }

      const cipherBytes = new Uint8Array(ciphertextBuf);
      const b64Cipher = bufToBase64(cipherBytes);
      const hexCipher = bufToHex(cipherBytes);
      const ivHex = bufToHex(ivBytes);

      if (fmt === 'json') {
        const payload = JSON.stringify({
          algorithm: algo.name,
          mode: algo.mode,
          keyDerivation: kDeriv === 'dotnet' ? 'SHA-256 (Hex Substring, .NET)' : 'SHA-256 (Raw Digest)',
          encrypted: b64Cipher,
          IV: ivHex
        }, null, 2);
        setCipherInput(payload);
      } else if (fmt === 'hex') {
        // Combined IV + Ciphertext in Hex
        setCipherInput(ivHex + hexCipher);
      } else {
        // Combined IV + Ciphertext in Base64
        const combined = new Uint8Array(ivBytes.length + cipherBytes.length);
        combined.set(ivBytes, 0);
        combined.set(cipherBytes, ivBytes.length);
        setCipherInput(bufToBase64(combined));
      }

      setStatus({
        valid: true,
        message: `${algo.name} encrypted successfully (${kDeriv === 'dotnet' ? '.NET Compatible' : 'Raw SHA-256'})`
      });
    } catch (err) {
      console.error('Encryption Error:', err);
      setStatus({ valid: false, message: `Encryption failed: ${err.message}` });
    }
  }, []);

  /* ============================================================
     Execute Decryption
     ============================================================ */
  const executeDecrypt = useCallback(async (cipherText, pass, algoKey, ivStr, kDeriv, fmt) => {
    if (!cipherText.trim()) {
      setPlainInput('');
      setStatus({ valid: true, message: 'Ready — waiting for ciphertext' });
      return;
    }

    const algo = ALGORITHMS[algoKey] || ALGORITHMS['aes-256-cbc'];

    try {
      const clean = cipherText.trim();

      // --- Classic Ciphers ---
      if (algo.isClassic) {
        const keyStr = pass || 'key';
        if (algoKey === 'rot13') {
          setPlainInput(rot13Text(clean));
          setStatus({ valid: true, message: 'ROT13 reversed' });
          return;
        }
        if (algoKey === 'caesar') {
          const shift = parseInt(keyStr, 10) || 3;
          setPlainInput(caesarText(clean, shift, true));
          setStatus({ valid: true, message: `Caesar -${shift} decrypted` });
          return;
        }
        if (algoKey === 'xor') {
          const inputBytes = fmt === 'hex' ? hexToBuf(clean) : base64ToBuf(clean);
          setPlainInput(new TextDecoder().decode(xorBytes(inputBytes, keyStr)));
          setStatus({ valid: true, message: 'XOR decrypted successfully' });
          return;
        }
        if (algoKey === 'rc4') {
          const inputBytes = fmt === 'hex' ? hexToBuf(clean) : base64ToBuf(clean);
          setPlainInput(new TextDecoder().decode(rc4Bytes(inputBytes, keyStr)));
          setStatus({ valid: true, message: 'RC4 decrypted successfully' });
          return;
        }
      }

      // --- Legacy PBKDF2 AES-GCM ---
      if (algo.isLegacy) {
        let stripped = clean;
        if (stripped.startsWith('{') && stripped.includes('}')) {
          stripped = stripped.substring(stripped.indexOf('}') + 1).trim();
        }
        const combined = fmt === 'hex' ? hexToBuf(stripped) : base64ToBuf(stripped);
        if (combined.length < 28) throw new Error('Ciphertext too short (requires 16-byte salt + 12-byte IV + data)');
        const salt = combined.slice(0, 16);
        const ivBytes = combined.slice(16, 28);
        const ct = combined.slice(28);
        const derivedKey = await derivePbkdf2Key(pass, salt, 256);
        const decryptedBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, derivedKey, ct);
        setPlainInput(new TextDecoder().decode(decryptedBuf));
        setStatus({ valid: true, message: 'AES-GCM decrypted successfully' });
        return;
      }

      // --- Modern AES (CBC / GCM) ---
      if (!pass) {
        setStatus({ valid: false, message: 'Encryption key is required to decrypt' });
        return;
      }

      // Parse input payload: check if JSON { encrypted, IV }
      let targetCipherBytes = null;
      let targetIvBytes = null;

      if (clean.startsWith('{') && clean.endsWith('}')) {
        try {
          const parsed = JSON.parse(clean);
          const encField = parsed.encrypted || parsed.cipher || parsed.data;
          const ivField = parsed.IV || parsed.iv || parsed.nonce;
          if (encField) {
            targetCipherBytes = base64ToBuf(encField);
          }
          if (ivField) {
            if (/^[0-9a-fA-F]+$/.test(ivField) && ivField.length === algo.ivBytes * 2) {
              targetIvBytes = hexToBuf(ivField);
            } else {
              targetIvBytes = new Uint8Array(algo.ivBytes);
              for (let i = 0; i < algo.ivBytes; i++) {
                targetIvBytes[i] = i < ivField.length ? ivField.charCodeAt(i) : 0;
              }
            }
          }
        } catch {
          // not valid JSON, treat as raw string
        }
      }

      // If not parsed from JSON, check IV field or packed formats
      if (!targetCipherBytes) {
        if (fmt === 'hex' || (/^[0-9a-fA-F]+$/.test(clean) && clean.length > algo.ivBytes * 2)) {
          // Hex representation
          const allBytes = hexToBuf(clean);
          if (!targetIvBytes && allBytes.length >= algo.ivBytes + 16) {
            targetIvBytes = allBytes.slice(0, algo.ivBytes);
            targetCipherBytes = allBytes.slice(algo.ivBytes);
          } else {
            targetCipherBytes = allBytes;
          }
        } else {
          // Base64 representation
          try {
            const allBytes = base64ToBuf(clean);
            if (!targetIvBytes && allBytes.length >= algo.ivBytes + 16) {
              targetIvBytes = allBytes.slice(0, algo.ivBytes);
              targetCipherBytes = allBytes.slice(algo.ivBytes);
            } else {
              targetCipherBytes = allBytes;
            }
          } catch {
            throw new Error('Invalid Base64 or Hex ciphertext string.');
          }
        }
      }

      // If IV is still not found from payload, use manual IV from state
      if (!targetIvBytes) {
        if (ivStr && ivStr.trim()) {
          const cleanIv = ivStr.trim();
          if (/^[0-9a-fA-F]+$/.test(cleanIv) && cleanIv.length === algo.ivBytes * 2) {
            targetIvBytes = hexToBuf(cleanIv);
          } else {
            targetIvBytes = new Uint8Array(algo.ivBytes);
            for (let i = 0; i < algo.ivBytes; i++) {
              targetIvBytes[i] = i < cleanIv.length ? cleanIv.charCodeAt(i) : 0;
            }
          }
        } else {
          throw new Error(`IV / Nonce is required for ${algo.name}. Provide it in the IV field or JSON payload.`);
        }
      }

      // Derive Key
      const keyObj = kDeriv === 'dotnet'
        ? await deriveDotNetSha256Key(pass, algo.keyBytes, algo.mode === 'CBC' ? 'AES-CBC' : 'AES-GCM')
        : await deriveRawSha256Key(pass, algo.keyBytes, algo.mode === 'CBC' ? 'AES-CBC' : 'AES-GCM');

      let decryptedBuf;
      if (algo.mode === 'CBC') {
        decryptedBuf = await crypto.subtle.decrypt(
          { name: 'AES-CBC', iv: targetIvBytes },
          keyObj,
          targetCipherBytes
        );
      } else {
        decryptedBuf = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: targetIvBytes, tagLength: 128 },
          keyObj,
          targetCipherBytes
        );
      }

      const decodedText = new TextDecoder().decode(decryptedBuf);
      setPlainInput(decodedText);
      setStatus({
        valid: true,
        message: `${algo.name} decrypted successfully (${kDeriv === 'dotnet' ? '.NET Compatible' : 'Raw SHA-256'})`
      });
    } catch (err) {
      console.error('Decryption Error:', err);
      const isAuthErr = err.name === 'OperationError' || err.message?.includes('decrypt');
      const msg = isAuthErr
        ? 'Decryption failed: Incorrect key, wrong IV, or authentication tag verification failed.'
        : `Decryption failed: ${err.message}`;
      setStatus({ valid: false, message: msg });
    }
  }, []);

  // Debounced execution when inputs change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mode === 'encrypt') {
        executeEncrypt(plainInput, key, algorithm, iv, keyDerivation, outputFormat);
      } else {
        executeDecrypt(cipherInput, key, algorithm, iv, keyDerivation, outputFormat);
      }
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [plainInput, cipherInput, key, algorithm, iv, keyDerivation, mode, outputFormat, executeEncrypt, executeDecrypt]);

  // Swap Mode: flushes output into input and toggles mode
  const handleSwapMode = () => {
    if (mode === 'encrypt') {
      setMode('decrypt');
      showToast('Switched to Decrypt mode', 'info');
    } else {
      setMode('encrypt');
      showToast('Switched to Encrypt mode', 'info');
    }
  };

  const copyOutput = () => {
    const text = mode === 'encrypt' ? cipherInput : plainInput;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Top Workspace Toolbar
  const toolbar = (
    <div className="cipher-toolbar-group">
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${mode === 'encrypt' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('encrypt')}
          title="Encrypt plaintext"
        >
          <Lock size={12} />
          <span>Encrypt</span>
        </button>
        <button
          className={`dw-btn dw-btn-sm ${mode === 'decrypt' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('decrypt')}
          title="Decrypt ciphertext"
        >
          <Unlock size={12} />
          <span>Decrypt</span>
        </button>
      </div>

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={handleSwapMode}
        title="Toggle between Encrypt and Decrypt"
      >
        <ArrowRightLeft size={12} />
        <span>Swap Mode</span>
      </button>

      <div className="cipher-toolbar-right">
        <button className="dw-btn dw-btn-primary dw-btn-sm" onClick={copyOutput} disabled={!((mode === 'encrypt' ? cipherInput : plainInput))}>
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
          <span className="cipher-status-valid">
            <ShieldCheck size={13} /> {status.message}
          </span>
        ) : (
          <span className="cipher-status-invalid">
            <AlertCircle size={13} /> {status.message}
          </span>
        )
      }
      statusRight={
        <span className="cipher-status-info">
          {currentAlgo.name} · {isAes ? (keyDerivation === 'dotnet' ? '.NET SHA-256' : 'Raw SHA-256') : 'Classic'} · {outputFormat.toUpperCase()}
        </span>
      }
    >
      <div className="cipher-workspace-container">
        {/* Controls Configuration Bar */}
        <div className="cipher-config-bar">
          {/* Algorithm Selector */}
          <div className="cipher-config-field">
            <label className="cipher-label">Algorithm</label>
            <select
              className="cipher-select"
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
            >
              <optgroup label="Modern AES (SHA-256 Key Derivation)">
                <option value="aes-128-cbc">AES-128-CBC (PKCS7 Padding)</option>
                <option value="aes-256-cbc">AES-256-CBC (PKCS7 Padding · Recommended)</option>
                <option value="aes-128-gcm">AES-128-GCM (Authenticated)</option>
                <option value="aes-256-gcm">AES-256-GCM (Authenticated · High Security)</option>
              </optgroup>
              <optgroup label="Legacy Web Crypto & Adobe">
                <option value="aes-gcm-pbkdf2">AES-GCM 256 (PBKDF2 100k)</option>
                <option value="aem-crypto">Adobe AEM CryptoSupport</option>
              </optgroup>
              <optgroup label="Stream & Classical Ciphers">
                <option value="rc4">RC4 Stream Cipher</option>
                <option value="xor">XOR Multi-byte Key</option>
                <option value="caesar">Caesar Shift Cipher</option>
                <option value="rot13">ROT13 (Symmetric)</option>
              </optgroup>
            </select>
          </div>

          {/* Key Derivation Strategy (Only for AES) */}
          {isAes && (
            <div className="cipher-config-field">
              <label className="cipher-label">Key Derivation</label>
              <select
                className="cipher-select"
                value={keyDerivation}
                onChange={e => setKeyDerivation(e.target.value)}
              >
                <option value="dotnet">.NET / Backend Compatible (SHA-256 Hex Substring)</option>
                <option value="raw">Raw SHA-256 Digest Bytes</option>
              </select>
            </div>
          )}

          {/* Encryption Key Input */}
          <div className="cipher-config-field cipher-key-field">
            <label className="cipher-label">
              <Key size={11} />
              <span>{algorithm === 'caesar' ? 'Shift Amount' : 'Encryption Key'}</span>
            </label>
            <div className="cipher-input-with-actions">
              <input
                type={algorithm === 'caesar' ? 'number' : 'text'}
                className="cipher-input-text"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={algorithm === 'caesar' ? '3' : 'Enter encryption key...'}
                spellCheck={false}
              />
              {algorithm !== 'rot13' && (
                <button
                  type="button"
                  className="cipher-btn-icon"
                  onClick={handleGenerateKey}
                  title="Generate secure random key"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </div>

          {/* IV / Nonce Field (Only for AES) */}
          {isAes && (
            <div className="cipher-config-field cipher-iv-field">
              <label className="cipher-label">
                <Hash size={11} />
                <span>{currentAlgo.mode === 'CBC' ? 'IV (16-byte Hex)' : 'Nonce (12-byte Hex)'}</span>
              </label>
              <div className="cipher-input-with-actions">
                <input
                  type="text"
                  className="cipher-input-text font-mono"
                  value={iv}
                  onChange={e => setIv(e.target.value)}
                  placeholder="Auto-generated hex..."
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="cipher-btn-icon"
                  onClick={handleRegenerateIv}
                  title="Regenerate random IV / Nonce"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Output Format Selector */}
          {(isAes || !isClassic) && (
            <div className="cipher-config-field">
              <label className="cipher-label">Output Format</label>
              <select
                className="cipher-select"
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
              >
                {isAes && <option value="json">JSON Object {"{ encrypted, IV }"}</option>}
                <option value="base64">Combined Base64</option>
                <option value="hex">Combined Hexadecimal</option>
              </select>
            </div>
          )}
        </div>

        {/* Dual Input/Output Views */}
        <div className="cipher-panes-row">
          {/* Left Pane: Plaintext */}
          <div className={`cipher-pane ${mode === 'encrypt' ? 'cipher-pane-input' : 'cipher-pane-output'}`}>
            <div className="cipher-pane-header">
              <div className="cipher-pane-title">
                <span>Plaintext</span>
                <span className={`cipher-mode-tag ${mode === 'encrypt' ? 'tag-input' : 'tag-output'}`}>
                  {mode === 'encrypt' ? 'INPUT' : 'OUTPUT'}
                </span>
              </div>
              <span className="cipher-char-count">{plainInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea"
              value={plainInput}
              onChange={e => {
                setPlainInput(e.target.value);
                if (mode !== 'encrypt') setMode('encrypt');
              }}
              placeholder="Enter plaintext message or JSON data to encrypt..."
              spellCheck={false}
              readOnly={mode === 'decrypt'}
            />
          </div>

          {/* Central Interactive Indicator */}
          <div className="cipher-direction-divider">
            <button
              className="cipher-direction-btn"
              onClick={handleSwapMode}
              title="Click to swap Encrypt/Decrypt mode"
            >
              <ArrowRight
                size={16}
                className={`cipher-arrow-icon ${mode === 'decrypt' ? 'flipped' : ''}`}
              />
              <span className="cipher-direction-text">{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
            </button>
          </div>

          {/* Right Pane: Ciphertext */}
          <div className={`cipher-pane ${mode === 'decrypt' ? 'cipher-pane-input' : 'cipher-pane-output'}`}>
            <div className="cipher-pane-header">
              <div className="cipher-pane-title">
                <span>Ciphertext</span>
                <span className={`cipher-mode-tag ${mode === 'decrypt' ? 'tag-input' : 'tag-output'}`}>
                  {mode === 'decrypt' ? 'INPUT' : 'OUTPUT'}
                </span>
              </div>
              <span className="cipher-char-count">{cipherInput.length} chars</span>
            </div>
            <textarea
              className="cipher-textarea cipher-textarea-code"
              value={cipherInput}
              onChange={e => {
                setCipherInput(e.target.value);
                if (mode !== 'decrypt') setMode('decrypt');
              }}
              placeholder="Paste Base64, Hex, or JSON payload to decrypt..."
              spellCheck={false}
              readOnly={mode === 'encrypt'}
            />
          </div>
        </div>

        {/* Informative Guidance Bar */}
        <div className="cipher-info-strip">
          <div className="cipher-info-badge">
            <Sliders size={12} />
            <span>
              {mode === 'encrypt'
                ? 'Encrypt Mode: Type on the left. Encrypted payload appears on the right.'
                : 'Decrypt Mode: Paste ciphertext or JSON payload on the right with the corresponding key & IV.'}
            </span>
          </div>
          {isAes && (
            <div className="cipher-info-compat">
              <span>Compatible with .NET AesManaged, C# AesCryptoServiceProvider, and Node.js crypto</span>
            </div>
          )}
        </div>

        {/* Code Snippets Section */}
        <CodeSnippetsPanel
          toolId="cipher-crypto"
          options={{
            algorithm,
            keyDerivation,
            mode: currentAlgo.mode || 'CBC',
            bits: currentAlgo.bits || 256,
            key: key || 'your-secret-key',
            iv: iv || '16-byte-hex-iv'
          }}
        />
      </div>
    </ToolWorkspace>
  );
};

export default CipherCryptoTool;