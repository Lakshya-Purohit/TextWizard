import React, { useState, useEffect, useMemo } from 'react';
import { Code2, Copy, Check, X } from 'lucide-react';
import './CodeSnippetsPanel.css';

/**
 * Returns dynamic, executable, production-grade code snippets
 * based on current tool state and configuration.
 */
function getSnippets(toolId, options = {}) {
  switch (toolId) {
    case 'cipher-crypto': {
      const algo = options.algorithm || 'aes-256-cbc';
      const isAes = algo.startsWith('aes-');
      const isGcm = algo.includes('-gcm');
      const is128 = algo.includes('128');
      const bits = is128 ? 128 : 256;
      const keyLen = bits / 8;
      const ivLen = isGcm ? 12 : 16;
      const passphrase = options.key || 'my-passphrase';
      const customIv = options.iv || (isGcm ? '0123456789abcdef01234567' : '0123456789abcdef0123456789abcdef');
      const sampleText = options.input ? options.input.slice(0, 100) : 'Hello DevWizard';

      if (algo === 'rot13') {
        return {
          languages: [
            { id: 'node', label: 'JavaScript (Node)' },
            { id: 'python', label: 'Python' },
            { id: 'csharp', label: 'C# (.NET)' }
          ],
          code: {
            node: `// ROT13 Cipher in Node.js
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

const text = ${JSON.stringify(sampleText)};
const rotated = rot13(text);
console.log('Rotated:', rotated);
console.log('Decoded:', rot13(rotated));`,
            python: `# ROT13 Cipher in Python 3
import codecs

text = ${JSON.stringify(sampleText)}
rotated = codecs.encode(text, 'rot_13')
print('Rotated:', rotated)
print('Decoded:', codecs.decode(rotated, 'rot_13'))`,
            csharp: `// ROT13 in C# (.NET)
using System;
using System.Text;

public class Rot13Cipher
{
    public static string Transform(string input)
    {
        var sb = new StringBuilder(input.Length);
        foreach (char c in input)
        {
            if (c >= 'a' && c <= 'z')
                sb.Append((char)('a' + (c - 'a' + 13) % 26));
            else if (c >= 'A' && c <= 'Z')
                sb.Append((char)('A' + (c - 'A' + 13) % 26));
            else
                sb.Append(c);
        }
        return sb.ToString();
    }

    public static void Main()
    {
        string text = ${JSON.stringify(sampleText)};
        string rotated = Transform(text);
        Console.WriteLine($"Rotated: {rotated}");
    }
}`
          }
        };
      }

      if (algo === 'caesar') {
        const shift = options.shift || 3;
        return {
          languages: [
            { id: 'node', label: 'JavaScript (Node)' },
            { id: 'python', label: 'Python' },
            { id: 'csharp', label: 'C# (.NET)' }
          ],
          code: {
            node: `// Caesar Cipher (Shift = ${shift}) in Node.js
function caesarCipher(str, shift, decrypt = false) {
  const s = decrypt ? (26 - (shift % 26)) % 26 : shift % 26;
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

const input = ${JSON.stringify(sampleText)};
const encrypted = caesarCipher(input, ${shift});
console.log('Encrypted:', encrypted);
console.log('Decrypted:', caesarCipher(encrypted, ${shift}, true));`,
            python: `# Caesar Cipher (Shift = ${shift}) in Python 3
def caesar(text: str, shift: int, decrypt: bool = False) -> str:
    s = (26 - (shift % 26)) % 26 if decrypt else shift % 26
    res = []
    for c in text:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            res.append(chr((ord(c) - base + s) % 26 + base))
        else:
            res.append(c)
    return ''.join(res)

encrypted = caesar(${JSON.stringify(sampleText)}, ${shift})
print('Encrypted:', encrypted)
print('Decrypted:', caesar(encrypted, ${shift}, decrypt=True))`,
            csharp: `// Caesar Cipher (Shift = ${shift}) in C# (.NET)
using System;
using System.Text;

public class CaesarCipher
{
    public static string Transform(string text, int shift, bool decrypt = false)
    {
        int s = decrypt ? (26 - (shift % 26)) % 26 : shift % 26;
        var sb = new StringBuilder(text.Length);
        foreach (char c in text)
        {
            if (char.IsLetter(c))
            {
                char baseChar = char.IsUpper(c) ? 'A' : 'a';
                sb.Append((char)(baseChar + (c - baseChar + s) % 26));
            }
            else sb.Append(c);
        }
        return sb.ToString();
    }
}`
          }
        };
      }

      if (algo === 'xor') {
        return {
          languages: [
            { id: 'node', label: 'JavaScript (Node)' },
            { id: 'python', label: 'Python' },
            { id: 'csharp', label: 'C# (.NET)' }
          ],
          code: {
            node: `// XOR Cipher with Hex Output in Node.js
function xorEncrypt(text, key) {
  const buf = Buffer.from(text, 'utf8');
  const keyBuf = Buffer.from(key, 'utf8');
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out.toString('hex');
}

function xorDecrypt(hexStr, key) {
  const buf = Buffer.from(hexStr, 'hex');
  const keyBuf = Buffer.from(key, 'utf8');
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out.toString('utf8');
}

const key = ${JSON.stringify(passphrase)};
const hex = xorEncrypt(${JSON.stringify(sampleText)}, key);
console.log('Hex Ciphertext:', hex);
console.log('Recovered:', xorDecrypt(hex, key));`,
            python: `# XOR Cipher in Python 3
def xor_crypt(data: bytes, key: bytes) -> bytes:
    return bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])

key = ${JSON.stringify(passphrase)}.encode('utf-8')
data = ${JSON.stringify(sampleText)}.encode('utf-8')
ciphertext = xor_crypt(data, key).hex()
print('Hex Ciphertext:', ciphertext)
recovered = xor_crypt(bytes.fromhex(ciphertext), key).decode('utf-8')
print('Recovered:', recovered)`,
            csharp: `// XOR Cipher in C# (.NET)
using System;
using System.Text;

public class XorCipher
{
    public static string Encrypt(string text, string key)
    {
        byte[] bText = Encoding.UTF8.GetBytes(text);
        byte[] bKey = Encoding.UTF8.GetBytes(key);
        byte[] outBytes = new byte[bText.Length];
        for (int i = 0; i < bText.Length; i++)
            outBytes[i] = (byte)(bText[i] ^ bKey[i % bKey.Length]);
        return Convert.ToHexString(outBytes).ToLower();
    }
}`
          }
        };
      }

      // Default to AES (CBC or GCM)
      const cipherModeStr = isGcm ? `aes-${bits}-gcm` : `aes-${bits}-cbc`;

      return {
        languages: [
          { id: 'node', label: 'JavaScript (Node)' },
          { id: 'python', label: 'Python' },
          { id: 'csharp', label: 'C# (.NET)' }
        ],
        code: {
          node: `// Node.js Native Crypto (Compatible with DevWizard & .NET SHA256 Key Derivation)
const crypto = require('crypto');

// .NET-compatible key derivation: SHA-256 hash truncated to ${keyLen} bytes
function getSha256Key(passphrase, length) {
  const hash = crypto.createHash('sha256').update(passphrase, 'utf8').digest('hex');
  return Buffer.from(hash.substring(0, length), 'latin1');
}

function encrypt(plainText, passphrase, ivHex) {
  const key = getSha256Key(passphrase, ${keyLen});
  const iv = ivHex ? Buffer.from(ivHex, 'hex') : crypto.randomBytes(${ivLen});
  const cipher = crypto.createCipheriv('${cipherModeStr}', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  ${isGcm ? `const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), authTag };` : `return { encrypted, iv: iv.toString('hex') };`}
}

function decrypt(payload, passphrase) {
  const key = getSha256Key(passphrase, ${keyLen});
  const iv = Buffer.from(payload.iv, 'hex');
  const decipher = crypto.createDecipheriv('${cipherModeStr}', key, iv);
  ${isGcm ? `decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));\n  ` : ''}let decrypted = decipher.update(payload.encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Test with current settings
const payload = encrypt(${JSON.stringify(sampleText)}, ${JSON.stringify(passphrase)}, ${JSON.stringify(customIv)});
console.log('Payload:', payload);
console.log('Decrypted:', decrypt(payload, ${JSON.stringify(passphrase)}));`,

          python: `# Python 3 (Requires: pip install cryptography)
import hashlib
import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
${!isGcm ? "from cryptography.hazmat.primitives import padding\n" : ''}
def get_sha256_key(passphrase: str, length: int) -> bytes:
    hex_hash = hashlib.sha256(passphrase.encode('utf-8')).hexdigest()
    return hex_hash[:length].encode('latin1')

def encrypt(text: str, passphrase: str, iv_hex: str = None):
    key = get_sha256_key(passphrase, ${keyLen})
    iv = bytes.fromhex(iv_hex) if iv_hex else os.urandom(${ivLen})
    ${isGcm ? `cipher = Cipher(algorithms.AES(key), modes.GCM(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(text.encode('utf-8')) + encryptor.finalize()
    return {
        'encrypted': base64.b64encode(ciphertext).decode('utf-8'),
        'iv': iv.hex(),
        'authTag': encryptor.tag.hex()
    }` : `padder = padding.PKCS7(128).padder()
    padded_data = padder.update(text.encode('utf-8')) + padder.finalize()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    return {
        'encrypted': base64.b64encode(ciphertext).decode('utf-8'),
        'iv': iv.hex()
    }`}

payload = encrypt(${JSON.stringify(sampleText)}, ${JSON.stringify(passphrase)}, ${JSON.stringify(customIv)})
print("Payload:", payload)`,

          csharp: `// C# / .NET 6+ (System.Security.Cryptography)
// Matches DevWizard SHA-256 key derivation & AES-${bits} ${isGcm ? 'GCM' : 'CBC'}
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

    public static (string Encrypted, string IV) Encrypt(string plainText, string passphrase, string ivHex)
    {
        byte[] key = GetSha256Key(passphrase, ${keyLen});
        byte[] iv = Convert.FromHexString(ivHex);
        ${isGcm ? `// AES-GCM supported natively in .NET Core 3.0+
        using var aesGcm = new AesGcm(key);
        byte[] plaintextBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] ciphertext = new byte[plaintextBytes.Length];
        byte[] tag = new byte[16];
        aesGcm.Encrypt(iv, plaintextBytes, ciphertext, tag);
        return (Convert.ToBase64String(ciphertext), Convert.ToHexString(iv).ToLower());` : `using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs, Encoding.UTF8))
        {
            sw.Write(plainText);
        }
        return (Convert.ToBase64String(ms.ToArray()), Convert.ToHexString(aes.IV).ToLower());`}
    }
}`
        }
      };
    }

    case 'json-studio': {
      const tab = options.tab || 'format';
      const target = options.convertTarget || 'yaml';
      const dir = options.convertDirection || 'json-to-target';

      if (tab === 'convert') {
        return {
          languages: [
            { id: 'node', label: 'JavaScript (Node)' },
            { id: 'python', label: 'Python' },
            { id: 'go', label: 'Go' },
            { id: 'java', label: 'Java' }
          ],
          code: {
            node: target === 'yaml'
              ? `// JSON ⇄ YAML Conversion in Node.js (npm install js-yaml)
const yaml = require('js-yaml');

${dir === 'json-to-target' ? `const jsonInput = '{"service":"api","port":8080,"status":"ok"}';
const parsed = JSON.parse(jsonInput);
const yamlOutput = yaml.dump(parsed, { indent: 2 });
console.log(yamlOutput);` : `const yamlInput = 'service: api\\nport: 8080\\nstatus: ok';
const parsed = yaml.load(yamlInput);
console.log(JSON.stringify(parsed, null, 2));`}`
              : target === 'csv'
                ? `// JSON ⇄ CSV Conversion in Node.js (npm install papaparse)
const Papa = require('papaparse');

${dir === 'json-to-target' ? `const items = [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}];
const csv = Papa.unparse(items);
console.log(csv);` : `const csvText = "id,name\\n1,Alice\\n2,Bob";
const parsed = Papa.parse(csvText, { header: true });
console.log(JSON.stringify(parsed.data, null, 2));`}`
                : target === 'string'
                  ? `// JSON ⇄ Escaped String in Node.js
${dir === 'json-to-target' ? `const data = { status: "success", count: 42 };
// Convert object to escaped JSON string literal
const escapedString = JSON.stringify(JSON.stringify(data));
console.log(escapedString);` : `// Convert escaped string to formatted JSON
const escapedInput = "{\\"status\\":\\"success\\",\\"count\\":42}";
const parsed = JSON.parse(escapedInput);
console.log(JSON.stringify(parsed, null, 2));`}`
                  : `// JSON ⇄ XML Conversion in Node.js (npm install fast-xml-parser)
const { XMLBuilder, XMLParser } = require('fast-xml-parser');

${dir === 'json-to-target' ? `const data = { root: { service: "auth", status: "active" } };
const builder = new XMLBuilder({ format: true });
console.log(builder.build(data));` : `const xml = '<root><service>auth</service></root>';
const parser = new XMLParser();
console.log(JSON.stringify(parser.parse(xml), null, 2));`}`,

            python: target === 'yaml'
              ? `# Python 3 YAML (pip install pyyaml)
import yaml, json

${dir === 'json-to-target' ? `data = {"service": "api", "port": 8080}
yaml_str = yaml.dump(data, default_flow_style=False)
print(yaml_str)` : `yaml_input = """
service: api
port: 8080
"""
data = yaml.safe_load(yaml_input)
print(json.dumps(data, indent=2))`}`
              : target === 'csv'
                ? `# Python 3 CSV
import csv, json, io

${dir === 'json-to-target' ? `data = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
output = io.StringIO()
writer = csv.DictWriter(output, fieldnames=data[0].keys())
writer.writeheader()
writer.writerows(data)
print(output.getvalue())` : `csv_data = """id,name
1,Alice
2,Bob"""
reader = csv.DictReader(io.StringIO(csv_data))
print(json.dumps(list(reader), indent=2))`}`
                : target === 'string'
                  ? `# Python 3 JSON Stringify & Unescape
import json

${dir === 'json-to-target' ? `data = {"status": "success", "count": 42}
escaped = json.dumps(json.dumps(data))
print(escaped)` : `escaped_input = '{"status": "success", "count": 42}'
data = json.loads(escaped_input)
print(json.dumps(data, indent=2))`}`
                  : `# Python 3 XML
import xml.etree.ElementTree as ET
import json

xml_data = "<root><service>auth</service></root>"
root = ET.fromstring(xml_data)
print({child.tag: child.text for child in root})`,

            go: `// Go standard library
package main

import (
    "encoding/json"
    "fmt"
)

func main() {
    raw := \`{"service":"api","port":8080}\`
    var obj map[string]interface{}
    if err := json.Unmarshal([]byte(raw), &obj); err != nil {
        panic(err)
    }
    pretty, _ := json.MarshalIndent(obj, "", "  ")
    fmt.Println(string(pretty))
}`,
            java: `// Java 17+ (Jackson / standard JSON)
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonConverter {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        String json = "{\\"service\\":\\"api\\",\\"port\\":8080}";
        Object obj = mapper.readValue(json, Object.class);
        String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        System.out.println(pretty);
    }
}`
          }
        };
      }

      // Default format tab — use live input if available
      const liveInput = options.input ? options.input.slice(0, 500) : '{"status":"ok","code":200}';
      return {
        languages: [
          { id: 'node', label: 'JavaScript (Node)' },
          { id: 'python', label: 'Python' },
          { id: 'csharp', label: 'C# (.NET)' },
          { id: 'go', label: 'Go' },
          { id: 'java', label: 'Java' }
        ],
        code: {
          node: `// Validate & Pretty-Print JSON in Node.js
function formatJson(rawJson, indent = 2) {
  try {
    const parsed = JSON.parse(rawJson);
    return { valid: true, formatted: JSON.stringify(parsed, null, indent) };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

const input = ${JSON.stringify(liveInput)};
console.log(formatJson(input).formatted);`,
          python: `# Validate & Pretty-Print JSON in Python 3
import json

def format_json(raw_json: str, indent: int = 2) -> str:
    try:
        parsed = json.loads(raw_json)
        return json.dumps(parsed, indent=indent)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")

input_str = ${JSON.stringify(liveInput)}
print(format_json(input_str))`,
          csharp: `// Validate & Pretty-Print JSON in C# (.NET 6+)
using System;
using System.Text.Json;

string rawJson = ${JSON.stringify(liveInput)};
try
{
    using var doc = JsonDocument.Parse(rawJson);
    var opts = new JsonSerializerOptions { WriteIndented = true };
    string pretty = JsonSerializer.Serialize(doc.RootElement, opts);
    Console.WriteLine(pretty);
}
catch (JsonException ex)
{
    Console.WriteLine($"Invalid JSON: {ex.Message}");
}`,
          go: `// Format & Validate JSON in Go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
)

func formatJSON(input string) (string, error) {
    var pretty bytes.Buffer
    err := json.Indent(&pretty, []byte(input), "", "  ")
    if err != nil {
        return "", err
    }
    return pretty.String(), nil
}

func main() {
    out, _ := formatJSON(${JSON.stringify(liveInput)})
    fmt.Println(out)
}`,
          java: `// Format JSON in Java using Jackson
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonFormatter {
    public static String format(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Object obj = mapper.readValue(json, Object.class);
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
    }

    public static void main(String[] args) throws Exception {
        System.out.println(format(${JSON.stringify(liveInput)}));
    }
}`
        }
      };
    }

    case 'jwt-decoder': {
      return {
        languages: [
          { id: 'node', label: 'JavaScript (Node)' },
          { id: 'python', label: 'Python' },
          { id: 'go', label: 'Go' }
        ],
        code: {
          node: `// Client-side / Node.js JWT Decoder without secret verification
function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const decodeBase64Url = (str) => {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  };

  return {
    header: decodeBase64Url(parts[0]),
    payload: decodeBase64Url(parts[1]),
    signature: parts[2]
  };
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
console.log(decodeJwt(token));`,
          python: `# Python 3 JWT Decoder
import json
import base64

def decode_jwt(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")

    def decode_part(seg: str) -> dict:
        rem = len(seg) % 4
        if rem > 0:
            seg += '=' * (4 - rem)
        decoded = base64.urlsafe_b64decode(seg)
        return json.loads(decoded.decode('utf-8'))

    return {
        'header': decode_part(parts[0]),
        'payload': decode_part(parts[1]),
        'signature': parts[2]
    }

print(decode_jwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."))`,
          go: `// Go JWT Payload Decoder
package main

import (
    "encoding/base64"
    "encoding/json"
    "fmt"
    "strings"
)

func decodeJWT(token string) (map[string]interface{}, error) {
    parts := strings.Split(token, ".")
    if len(parts) != 3 {
        return nil, fmt.Errorf("invalid token")
    }
    b, err := base64.RawURLEncoding.DecodeString(parts[1])
    if err != nil {
        return nil, err
    }
    var claims map[string]interface{}
    err = json.Unmarshal(b, &claims)
    return claims, err
}`
        }
      };
    }

    case 'hash-generator': {
      return {
        languages: [
          { id: 'node', label: 'JavaScript (Node)' },
          { id: 'python', label: 'Python' },
          { id: 'curl', label: 'cURL / Shell' },
          { id: 'go', label: 'Go' }
        ],
        code: {
          node: `// Node.js Hash Computation
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
          python: `# Python 3 Hash Computation
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
          curl: `# Linux / macOS Terminal One-Liners
echo -n "DevWizard Secure Hash" | md5sum
echo -n "DevWizard Secure Hash" | sha1sum
echo -n "DevWizard Secure Hash" | sha256sum
echo -n "DevWizard Secure Hash" | sha512sum`,
          go: `// Go Hash Generator
package main

import (
    "crypto/sha256"
    "encoding/hex"
    "fmt"
)

func main() {
    h := sha256.Sum256([]byte("DevWizard Secure Hash"))
    fmt.Println(hex.EncodeToString(h[:]))
}`
        }
      };
    }

    default: {
      const genericInput = options.input ? options.input.slice(0, 300) : 'your input here';
      const genericOutput = options.output ? options.output.slice(0, 300) : '';
      return {
        languages: [
          { id: 'node', label: 'JavaScript (Node)' },
          { id: 'python', label: 'Python' },
          { id: 'csharp', label: 'C# (.NET)' },
          { id: 'go', label: 'Go' }
        ],
        code: {
          node: `// DevWizard — Tool Integration (Node.js)
// Input: the text you passed into the tool
const input = ${JSON.stringify(genericInput)};

// Output: what the tool produced
const output = ${JSON.stringify(genericOutput || '(process the input to get output)')};

console.log('Input:', input);
console.log('Output:', output);`,
          python: `# DevWizard — Tool Integration (Python 3)
# Input: the text you passed into the tool
input_data = ${JSON.stringify(genericInput)}

# Output: what the tool produced
output_data = ${JSON.stringify(genericOutput || '(process the input to get output)')}

print('Input:', input_data)
print('Output:', output_data)`,
          csharp: `// DevWizard — Tool Integration (C# .NET)
using System;

string input = ${JSON.stringify(genericInput)};
string output = ${JSON.stringify(genericOutput || '(process the input to get output)')};

Console.WriteLine($"Input: {input}");
Console.WriteLine($"Output: {output}");`,
          go: `// DevWizard — Tool Integration (Go)
package main

import "fmt"

func main() {
    input := ${JSON.stringify(genericInput)}
    output := ${JSON.stringify(genericOutput || '(process the input to get output)')}
    fmt.Printf("Input: %s\\nOutput: %s\\n", input, output)
}`
        }
      };
    }
  }
}

/**
 * CodeSnippetsPanel (Modal Architecture)
 * Renders a '</> View Code' button that opens an elevated modal popup
 * with horizontal language tabs, dynamic snippets, and copy buttons.
 */
const CodeSnippetsPanel = ({ toolId, options = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('node');
  const [copied, setCopied] = useState(false);

  const snippetData = useMemo(() => getSnippets(toolId, options), [toolId, options]);
  const languages = snippetData.languages || [{ id: 'node', label: 'JavaScript (Node)' }];

  // Ensure active tab exists in current language list
  useEffect(() => {
    if (!languages.some(l => l.id === activeLang)) {
      setActiveLang(languages[0]?.id || 'node');
    }
  }, [languages, activeLang]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentCode = snippetData.code?.[activeLang] || snippetData.code?.node || '';

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dw-snippet-trigger-container dw-snippet-inline">
      <button
        type="button"
        className="dw-btn dw-btn-secondary dw-btn-sm dw-view-code-btn"
        onClick={() => setIsOpen(true)}
        title="Open ready-to-run code snippets modal"
        aria-haspopup="dialog"
      >
        <Code2 size={13} className="text-gold" />
        <span>&lt;/&gt; View Code</span>
      </button>

      {isOpen && (
        <div
          className="dw-snippet-modal-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="dw-snippet-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="snippet-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dw-snippet-modal-header">
              <div className="dw-snippet-modal-header-left">
                <Code2 size={16} className="text-gold" />
                <h3 id="snippet-modal-title" className="dw-snippet-modal-title">
                  Production Code Snippets
                </h3>
                <span className="dw-snippet-modal-tag font-mono">{toolId}</span>
              </div>
              <button
                type="button"
                className="dw-snippet-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Horizontal Tabs Bar */}
            <div className="dw-snippet-modal-tabs-row">
              <div className="dw-snippet-modal-tabs">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    className={`dw-snippet-modal-tab ${activeLang === lang.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveLang(lang.id);
                      setCopied(false);
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="dw-btn dw-btn-secondary dw-btn-sm dw-snippet-modal-copy-btn"
                onClick={handleCopy}
              >
                {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="dw-snippet-modal-body">
              <pre className="dw-snippet-code font-mono">
                <code>{currentCode}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="dw-snippet-modal-footer">
              <span className="dw-snippet-modal-note">
                ✨ Dynamically generated with your current parameters. Press <strong>Esc</strong> or click outside to close.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippetsPanel;
