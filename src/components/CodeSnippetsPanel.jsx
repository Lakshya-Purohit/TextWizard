import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import './CodeSnippetsPanel.css';

/**
 * Returns executable, real-world code snippets for developer tools
 */
function getSnippets(toolId, options = {}) {
  switch (toolId) {
    case 'cipher-crypto': {
      const bits = options.bits || 256;
      const isGcm = (options.mode || '').toUpperCase() === 'GCM';
      const cipherName = isGcm ? `aes-${bits}-gcm` : `aes-${bits}-cbc`;

      return {
        node: `// Node.js (Native crypto module)
const crypto = require('crypto');

function getSha256Key(passphrase, keyLength) {
  const hash = crypto.createHash('sha256').update(passphrase, 'utf8').digest('hex');
  return Buffer.from(hash.substring(0, keyLength), 'latin1');
}

function encrypt(text, passphrase) {
  const key = getSha256Key(passphrase, ${bits / 8});
  const iv = crypto.randomBytes(${isGcm ? 12 : 16});
  const cipher = crypto.createCipheriv('${cipherName}', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  ${isGcm ? `const authTag = cipher.getAuthTag().toString('hex');\n  return { encrypted, iv: iv.toString('hex'), authTag };` : `return { encrypted, iv: iv.toString('hex') };`}
}

const payload = encrypt('Hello DevWizard', '${options.key || 'my-secret-key'}');
console.log('Encrypted Payload:', payload);`,

        python: `# Python 3 (cryptography library: pip install cryptography)
import hashlib
import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

def get_sha256_key(passphrase: str, key_length: int) -> bytes:
    hex_hash = hashlib.sha256(passphrase.encode('utf-8')).hexdigest()
    return hex_hash[:key_length].encode('latin1')

def encrypt_aes_${isGcm ? 'gcm' : 'cbc'}(text: str, passphrase: str):
    key = get_sha256_key(passphrase, ${bits / 8})
    iv = os.urandom(${isGcm ? 12 : 16})
    ${isGcm ? `cipher = Cipher(algorithms.AES(key), modes.GCM(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(text.encode('utf-8')) + encryptor.finalize()
    return {
        'encrypted': base64.b64encode(ciphertext).decode('utf-8'),
        'iv': iv.hex(),
        'auth_tag': encryptor.tag.hex()
    }` : `padder = padding.PKCS7(128).padder()
    padded_data = padder.update(text.encode('utf-8')) + padder.finalize()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    return {
        'encrypted': base64.b64encode(ciphertext).decode('utf-8'),
        'iv': iv.hex()
    }`}

result = encrypt_aes_${isGcm ? 'gcm' : 'cbc'}('Hello DevWizard', '${options.key || 'my-secret-key'}')
print(result)`,

        csharp: `// C# / .NET (System.Security.Cryptography)
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

public class DevWizardEncryption
{
    private static byte[] GetSha256Key(string passphrase, int keyLength)
    {
        using var sha = SHA256.Create();
        byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes(passphrase));
        string hex = Convert.ToHexString(hash).ToLower();
        return Encoding.Latin1.GetBytes(hex.Substring(0, keyLength));
    }

    public static (string Encrypted, string IV) Encrypt(string plainText, string passphrase)
    {
        byte[] key = GetSha256Key(passphrase, ${bits / 8});
        using var aes = Aes.Create();
        aes.Key = key;
        aes.Mode = CipherMode.${isGcm ? 'CBC' : 'CBC'};
        aes.Padding = PaddingMode.PKCS7;
        aes.GenerateIV();

        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return (Convert.ToBase64String(ms.ToArray()), Convert.ToHexString(aes.IV).ToLower());
    }
}`
      };
    }

    case 'jwt-decoder': {
      return {
        node: `// Node.js / JavaScript
function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT token');
  
  const decodeBase64Url = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  };

  return {
    header: decodeBase64Url(parts[0]),
    payload: decodeBase64Url(parts[1]),
    signature: parts[2]
  };
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
console.log(decodeJwt(token));`,

        python: `# Python 3
import json
import base64

def decode_jwt(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    
    def decode_part(s: str) -> dict:
        rem = len(s) % 4
        if rem > 0:
            s += '=' * (4 - rem)
        decoded = base64.urlsafe_b64decode(s)
        return json.loads(decoded.decode('utf-8'))
        
    return {
        'header': decode_part(parts[0]),
        'payload': decode_part(parts[1]),
        'signature': parts[2]
    }

print(decode_jwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."))`,

        go: `// Go
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
)

func decodeJWT(token string) (header, payload map[string]interface{}, err error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, nil, fmt.Errorf("invalid JWT format")
	}

	decode := func(seg string) (map[string]interface{}, error) {
		b, err := base64.RawURLEncoding.DecodeString(seg)
		if err != nil {
			return nil, err
		}
		var m map[string]interface{}
		return m, json.Unmarshal(b, &m)
	}

	header, err = decode(parts[0])
	if err != nil { return }
	payload, err = decode(parts[1])
	return
}`
      };
    }

    case 'hash-generator': {
      return {
        node: `// Node.js
const crypto = require('crypto');

function computeHashes(input) {
  return {
    md5: crypto.createHash('md5').update(input, 'utf8').digest('hex'),
    sha1: crypto.createHash('sha1').update(input, 'utf8').digest('hex'),
    sha256: crypto.createHash('sha256').update(input, 'utf8').digest('hex'),
    sha512: crypto.createHash('sha512').update(input, 'utf8').digest('hex')
  };
}

console.log(computeHashes('DevWizard Secure Hash'));`,

        python: `# Python 3
import hashlib

def compute_hashes(text: str) -> dict:
    data = text.encode('utf-8')
    return {
        'md5': hashlib.md5(data).hexdigest(),
        'sha1': hashlib.sha1(data).hexdigest(),
        'sha256': hashlib.sha256(data).hexdigest(),
        'sha512': hashlib.sha512(data).hexdigest()
    }

print(compute_hashes('DevWizard Secure Hash'))`,

        go: `// Go
package main

import (
	"crypto/md5"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
)

func sha256Hash(text string) string {
	h := sha256.Sum256([]byte(text))
	return hex.EncodeToString(h[:])
}

func main() {
	fmt.Println("SHA-256:", sha256Hash("DevWizard Secure Hash"))
}`
      };
    }

    default: {
      return {
        node: `// Node.js utility integration
console.log("Integrate DevWizard tool logic directly in your application.");`,
        python: `# Python utility integration
print("Integrate DevWizard tool logic directly in your application.")`,
        go: `// Go utility integration
package main
import "fmt"
func main() { fmt.Println("DevWizard tool integration") }`
      };
    }
  }
}

const CodeSnippetsPanel = ({ toolId, options = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('node');
  const [copied, setCopied] = useState(false);

  const snippets = getSnippets(toolId, options);
  const currentCode = snippets[activeTab] || snippets.node || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dw-snippet-panel">
      <button
        type="button"
        className="dw-snippet-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="dw-snippet-toggle-left">
          <Code2 size={14} className="dw-snippet-icon" />
          <span className="dw-snippet-title">Use this in your code</span>
          <span className="dw-snippet-badge">Executable Snippets</span>
        </div>
        <div className="dw-snippet-toggle-right">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="dw-snippet-body">
          <div className="dw-snippet-tabs-bar">
            <div className="dw-snippet-tabs">
              <button
                type="button"
                className={`dw-snippet-tab ${activeTab === 'node' ? 'active' : ''}`}
                onClick={() => setActiveTab('node')}
              >
                Node.js / JS
              </button>
              <button
                type="button"
                className={`dw-snippet-tab ${activeTab === 'python' ? 'active' : ''}`}
                onClick={() => setActiveTab('python')}
              >
                Python
              </button>
              <button
                type="button"
                className={`dw-snippet-tab ${activeTab === 'csharp' || activeTab === 'go' ? 'active' : ''}`}
                onClick={() => setActiveTab(snippets.csharp ? 'csharp' : 'go')}
              >
                {snippets.csharp ? 'C# / .NET' : 'Go'}
              </button>
            </div>

            <button
              type="button"
              className="dw-btn dw-btn-ghost dw-btn-sm dw-snippet-copy-btn"
              onClick={handleCopy}
            >
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
            </button>
          </div>

          <pre className="dw-snippet-code font-mono">
            <code>{currentCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeSnippetsPanel;
