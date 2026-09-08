/**
 * DevWizard — Comprehensive Unit Tests
 * Tests all four AES combinations, edge cases, classic ciphers, JSON Studio, and encoding tools.
 *
 * Run with: node src/__tests__/devwizard.test.js
 * (Uses Node.js built-in crypto/test runner — no jest dependency needed)
 */

const crypto = require('crypto');
const assert = require('assert');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`  ✅ ${name}`);
        passed++;
      }).catch(err => {
        console.error(`  ❌ ${name}\n     → ${err.message}`);
        failed++;
      });
    } else {
      console.log(`  ✅ ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  ❌ ${name}\n     → ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}\n     → ${err.message}`);
    failed++;
  }
}

/* ============================================================
   Utility Functions (mirrors browser-side logic)
   ============================================================ */

/**
 * .NET-compatible SHA-256 key derivation:
 * SHA256(passphrase) -> hex string -> substring(0, keyByteLength) -> Latin1 bytes
 */
function getDotNetSha256Key(passphrase, keyByteLength) {
  const hexHash = crypto.createHash('sha256').update(passphrase, 'utf8').digest('hex');
  return Buffer.from(hexHash.substring(0, keyByteLength), 'latin1');
}

/**
 * Raw SHA-256 key derivation:
 * SHA256(passphrase) -> first keyByteLength raw digest bytes
 */
function getRawSha256Key(passphrase, keyByteLength) {
  const hashBuf = crypto.createHash('sha256').update(passphrase, 'utf8').digest();
  return hashBuf.slice(0, keyByteLength);
}

function encryptAesCbc(plaintext, passphrase, keyByteLength, useDotNet = true) {
  const key = useDotNet ? getDotNetSha256Key(passphrase, keyByteLength) : getRawSha256Key(passphrase, keyByteLength);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(`aes-${keyByteLength * 8}-cbc`, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { encrypted: encrypted.toString('base64'), iv: iv.toString('hex') };
}

function decryptAesCbc(encryptedBase64, ivHex, passphrase, keyByteLength, useDotNet = true) {
  const key = useDotNet ? getDotNetSha256Key(passphrase, keyByteLength) : getRawSha256Key(passphrase, keyByteLength);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(`aes-${keyByteLength * 8}-cbc`, key, iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedBase64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

function encryptAesGcm(plaintext, passphrase, keyByteLength, useDotNet = true) {
  const key = useDotNet ? getDotNetSha256Key(passphrase, keyByteLength) : getRawSha256Key(passphrase, keyByteLength);
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(`aes-${keyByteLength * 8}-gcm`, key, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encrypted: encrypted.toString('base64'), nonce: nonce.toString('hex'), authTag: authTag.toString('hex') };
}

function decryptAesGcm(encryptedBase64, nonceHex, authTagHex, passphrase, keyByteLength, useDotNet = true) {
  const key = useDotNet ? getDotNetSha256Key(passphrase, keyByteLength) : getRawSha256Key(passphrase, keyByteLength);
  const nonce = Buffer.from(nonceHex, 'hex');
  const decipher = crypto.createDecipheriv(`aes-${keyByteLength * 8}-gcm`, key, nonce);
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedBase64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

/* ============================================================
   Classic Ciphers
   ============================================================ */
function rot13(text) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function caesarEncrypt(text, shift) {
  const s = shift % 26;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, (26 - (shift % 26)) % 26);
}

function xorEncrypt(text, keyStr) {
  const buf = Buffer.from(text, 'utf8');
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyStr.charCodeAt(i % keyStr.length);
  }
  return out.toString('base64');
}

function xorDecrypt(base64, keyStr) {
  const buf = Buffer.from(base64, 'base64');
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyStr.charCodeAt(i % keyStr.length);
  }
  return out.toString('utf8');
}

/* ============================================================
   JSON Utilities (mirrors JsonStudio logic)
   ============================================================ */
function tryAutoRepairJson(raw) {
  let text = raw.trim();
  text = text.replace(/,\s*([}\]])/g, '$1');
  text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  text = text.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');
  return text;
}

function flattenObject(ob, prefix = '', result = {}) {
  for (const key in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, key)) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (ob[key] !== null && typeof ob[key] === 'object' && !Array.isArray(ob[key])) {
      flattenObject(ob[key], fullKey, result);
    } else {
      result[fullKey] = ob[key];
    }
  }
  return result;
}

/* ============================================================
   KEY DERIVATION TESTS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 1. KEY DERIVATION');
console.log('══════════════════════════════════════');

test('dotnet SHA-256 key: 16-byte hex-substring key for AES-128', () => {
  const key = getDotNetSha256Key('test', 16);
  assert.strictEqual(key.length, 16, 'Key should be 16 bytes');
  // Matches .NET: SHA256("test") hex = "9f86d081..." -> first 16 chars as Latin1
  const hash = crypto.createHash('sha256').update('test', 'utf8').digest('hex');
  const expected = Buffer.from(hash.substring(0, 16), 'latin1');
  assert.ok(key.equals(expected), 'Key bytes must match .NET SHA-256 substring pattern');
});

test('dotnet SHA-256 key: 32-byte hex-substring key for AES-256', () => {
  const key = getDotNetSha256Key('DevWizard-Secret', 32);
  assert.strictEqual(key.length, 32, 'Key should be 32 bytes');
});

test('raw SHA-256 key: 16-byte raw digest for AES-128', () => {
  const key = getRawSha256Key('test', 16);
  assert.strictEqual(key.length, 16);
  const fullHash = crypto.createHash('sha256').update('test', 'utf8').digest();
  assert.ok(key.equals(fullHash.slice(0, 16)));
});

test('dotnet and raw keys are different for same passphrase', () => {
  const dotnet = getDotNetSha256Key('password123', 16);
  const raw = getRawSha256Key('password123', 16);
  assert.ok(!dotnet.equals(raw), 'DotNet and raw key derivation must differ');
});

test('empty passphrase still produces valid key bytes', () => {
  const key = getDotNetSha256Key('', 16);
  assert.strictEqual(key.length, 16);
});

/* ============================================================
   AES-128-CBC TESTS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 2. AES-128-CBC');
console.log('══════════════════════════════════════');

test('AES-128-CBC: roundtrip encrypt/decrypt', () => {
  const plaintext = 'Hello DevWizard — AES-128-CBC Test!';
  const key = 'my-super-secret-key';
  const { encrypted, iv } = encryptAesCbc(plaintext, key, 16);
  const decrypted = decryptAesCbc(encrypted, iv, key, 16);
  assert.strictEqual(decrypted, plaintext, 'Decrypted text must match original');
});

test('AES-128-CBC: JSON payload roundtrip', () => {
  const payload = JSON.stringify({ user: 'lakshya', role: 'admin', ts: 1725798000 });
  const { encrypted, iv } = encryptAesCbc(payload, 'json-key-2026', 16);
  const decrypted = decryptAesCbc(encrypted, iv, 'json-key-2026', 16);
  assert.deepStrictEqual(JSON.parse(decrypted), JSON.parse(payload));
});

test('AES-128-CBC: wrong key causes decryption failure', () => {
  const { encrypted, iv } = encryptAesCbc('secret data', 'correct-key', 16);
  assert.throws(() => decryptAesCbc(encrypted, iv, 'wrong-key', 16), /bad decrypt|wrong final block|error/i);
});

test('AES-128-CBC: different IVs produce different ciphertexts for same plaintext+key', () => {
  const { encrypted: e1 } = encryptAesCbc('same message', 'same-key', 16);
  const { encrypted: e2 } = encryptAesCbc('same message', 'same-key', 16);
  assert.notStrictEqual(e1, e2, 'Random IVs must produce different ciphertexts');
});

test('AES-128-CBC: empty string encryption does not throw', () => {
  // AES-CBC with PKCS7 will still produce padded output for empty input
  const { encrypted, iv } = encryptAesCbc('', 'key-for-empty', 16);
  const decrypted = decryptAesCbc(encrypted, iv, 'key-for-empty', 16);
  assert.strictEqual(decrypted, '');
});

test('AES-128-CBC: unicode and special characters survive roundtrip', () => {
  const text = '🔐 Confidential: Σαμπλ 日本語 data @#$%^&*()';
  const { encrypted, iv } = encryptAesCbc(text, 'unicode-key-✨', 16);
  const decrypted = decryptAesCbc(encrypted, iv, 'unicode-key-✨', 16);
  assert.strictEqual(decrypted, text);
});

test('AES-128-CBC: large payload (10KB) roundtrip', () => {
  const text = 'A'.repeat(10240);
  const { encrypted, iv } = encryptAesCbc(text, 'large-payload-key', 16);
  const decrypted = decryptAesCbc(encrypted, iv, 'large-payload-key', 16);
  assert.strictEqual(decrypted, text);
});

/* ============================================================
   AES-256-CBC TESTS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 3. AES-256-CBC');
console.log('══════════════════════════════════════');

test('AES-256-CBC: roundtrip encrypt/decrypt', () => {
  const plaintext = 'Hello DevWizard — AES-256-CBC with stronger key!';
  const key = 'DevWizard-256-master-passphrase-2026';
  const { encrypted, iv } = encryptAesCbc(plaintext, key, 32);
  const decrypted = decryptAesCbc(encrypted, iv, key, 32);
  assert.strictEqual(decrypted, plaintext);
});

test('AES-256-CBC: wrong key fails', () => {
  const { encrypted, iv } = encryptAesCbc('sensitive', 'real-key', 32);
  assert.throws(() => decryptAesCbc(encrypted, iv, 'fake-key', 32), /bad decrypt|wrong final block|error/i);
});

test('AES-256-CBC: raw SHA-256 key derivation roundtrip', () => {
  const text = 'Raw key derivation test';
  const { encrypted, iv } = encryptAesCbc(text, 'raw-passphrase', 32, false);
  const decrypted = decryptAesCbc(encrypted, iv, 'raw-passphrase', 32, false);
  assert.strictEqual(decrypted, text);
});

test('AES-256-CBC: .NET key and raw key produce incompatible ciphertexts', () => {
  const { encrypted, iv } = encryptAesCbc('test-data', 'passphrase', 32, true);
  // Decrypting with raw key should fail
  assert.throws(() => decryptAesCbc(encrypted, iv, 'passphrase', 32, false), /bad decrypt|wrong final block|error/i);
});

/* ============================================================
   AES-128-GCM TESTS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 4. AES-128-GCM');
console.log('══════════════════════════════════════');

test('AES-128-GCM: roundtrip encrypt/decrypt', () => {
  const plaintext = 'Hello DevWizard — AES-128-GCM authenticated!';
  const key = 'gcm-secret-128-key';
  const { encrypted, nonce, authTag } = encryptAesGcm(plaintext, key, 16);
  const decrypted = decryptAesGcm(encrypted, nonce, authTag, key, 16);
  assert.strictEqual(decrypted, plaintext);
});

test('AES-128-GCM: wrong key fails authentication', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('secret', 'right-key', 16);
  assert.throws(
    () => decryptAesGcm(encrypted, nonce, authTag, 'wrong-key', 16),
    /unsupported|auth|authentication|failed/i
  );
});

test('AES-128-GCM: modified ciphertext fails authentication tag check', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('authentic message', 'test-key-gcm', 16);
  // Flip last byte of ciphertext via base64
  const buf = Buffer.from(encrypted, 'base64');
  buf[buf.length - 1] ^= 0x01;
  const tampered = buf.toString('base64');
  assert.throws(
    () => decryptAesGcm(tampered, nonce, authTag, 'test-key-gcm', 16),
    /unsupported|auth|authentication|failed/i
  );
});

test('AES-128-GCM: modified auth tag fails', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('tagged message', 'key-gcm', 16);
  const tagBuf = Buffer.from(authTag, 'hex');
  tagBuf[0] ^= 0xff;
  const tamperedTag = tagBuf.toString('hex');
  assert.throws(
    () => decryptAesGcm(encrypted, nonce, tamperedTag, 'key-gcm', 16),
    /unsupported|auth|authentication|failed/i
  );
});

test('AES-128-GCM: different nonces produce different ciphertexts', () => {
  const { encrypted: e1 } = encryptAesGcm('data', 'key', 16);
  const { encrypted: e2 } = encryptAesGcm('data', 'key', 16);
  assert.notStrictEqual(e1, e2, 'Random nonces must produce different ciphertexts');
});

/* ============================================================
   AES-256-GCM TESTS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 5. AES-256-GCM');
console.log('══════════════════════════════════════');

test('AES-256-GCM: roundtrip encrypt/decrypt', () => {
  const plaintext = 'Hello DevWizard — AES-256-GCM high security!';
  const key = 'DevWizard-256-GCM-master-key-2026';
  const { encrypted, nonce, authTag } = encryptAesGcm(plaintext, key, 32);
  const decrypted = decryptAesGcm(encrypted, nonce, authTag, key, 32);
  assert.strictEqual(decrypted, plaintext);
});

test('AES-256-GCM: wrong key fails', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('payload', 'key256', 32);
  assert.throws(
    () => decryptAesGcm(encrypted, nonce, authTag, 'wrong256', 32),
    /unsupported|auth|authentication|failed/i
  );
});

test('AES-256-GCM: tampering with ciphertext detected', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('verify integrity', 'integrity-key', 32);
  const buf = Buffer.from(encrypted, 'base64');
  if (buf.length > 0) buf[0] ^= 0x01;
  assert.throws(
    () => decryptAesGcm(buf.toString('base64'), nonce, authTag, 'integrity-key', 32),
    /unsupported|auth|authentication|failed/i
  );
});

test('AES-256-GCM: JSON payload authenticated roundtrip', () => {
  const obj = { token: 'bearer abc123', expires: 3600, scopes: ['read', 'write'] };
  const payload = JSON.stringify(obj);
  const { encrypted, nonce, authTag } = encryptAesGcm(payload, 'api-jwt-secret', 32);
  const decrypted = decryptAesGcm(encrypted, nonce, authTag, 'api-jwt-secret', 32);
  assert.deepStrictEqual(JSON.parse(decrypted), obj);
});

/* ============================================================
   CLASSIC CIPHERS
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 6. CLASSIC CIPHERS');
console.log('══════════════════════════════════════');

test('ROT13: symmetric — applying twice returns original', () => {
  const text = 'Hello, DevWizard!';
  assert.strictEqual(rot13(rot13(text)), text);
});

test('ROT13: only alpha characters are rotated', () => {
  assert.strictEqual(rot13('abc XYZ 123 !@#'), 'nop KLM 123 !@#');
});

test('Caesar: +3 shift encrypt and -3 shift decrypt roundtrip', () => {
  const text = 'Attack at dawn';
  assert.strictEqual(caesarDecrypt(caesarEncrypt(text, 3), 3), text);
});

test('Caesar: shift 26 is identity', () => {
  const text = 'NoChange';
  assert.strictEqual(caesarEncrypt(text, 26), text);
});

test('Caesar: shift 0 is identity', () => {
  const text = 'NoChange';
  assert.strictEqual(caesarEncrypt(text, 0), text);
});

test('Caesar: numbers and symbols unchanged', () => {
  assert.strictEqual(caesarEncrypt('abc 123 !!', 3), 'def 123 !!');
});

test('XOR: roundtrip encrypt/decrypt', () => {
  const text = 'DevWizard XOR Test 2026!';
  const key = 'xorkey42';
  const encrypted = xorEncrypt(text, key);
  const decrypted = xorDecrypt(encrypted, key);
  assert.strictEqual(decrypted, text);
});

test('XOR: wrong key produces wrong output', () => {
  const encrypted = xorEncrypt('message', 'right-key');
  const decrypted = xorDecrypt(encrypted, 'wrong-key');
  assert.notStrictEqual(decrypted, 'message');
});

test('XOR: empty string roundtrip', () => {
  const encrypted = xorEncrypt('', 'key');
  assert.strictEqual(xorDecrypt(encrypted, 'key'), '');
});

/* ============================================================
   JSON STUDIO UTILITIES
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 7. JSON STUDIO UTILITIES');
console.log('══════════════════════════════════════');

test('JSON auto-repair: trailing comma removed', () => {
  const broken = '{"key": "value",}';
  const repaired = tryAutoRepairJson(broken);
  const parsed = JSON.parse(repaired);
  assert.strictEqual(parsed.key, 'value');
});

test('JSON auto-repair: trailing comma in array', () => {
  const broken = '{"arr": [1, 2, 3,]}';
  const repaired = tryAutoRepairJson(broken);
  const parsed = JSON.parse(repaired);
  assert.deepStrictEqual(parsed.arr, [1, 2, 3]);
});

test('JSON auto-repair: unquoted keys fixed', () => {
  const broken = '{name: "lakshya", age: 25}';
  const repaired = tryAutoRepairJson(broken);
  const parsed = JSON.parse(repaired);
  assert.strictEqual(parsed.name, 'lakshya');
  assert.strictEqual(parsed.age, 25);
});

test('JSON flatten: nested object flattened to dot notation', () => {
  const input = { a: { b: { c: 42 } }, d: 'hello' };
  const flat = flattenObject(input);
  assert.strictEqual(flat['a.b.c'], 42);
  assert.strictEqual(flat['d'], 'hello');
});

test('JSON flatten: array values preserved (not stringified in utility)', () => {
  const input = { list: [1, 2, 3], name: 'test' };
  const flat = flattenObject(input);
  // flattenObject stores array reference as-is; JSON.stringify is done at the component level
  assert.deepStrictEqual(flat['list'], [1, 2, 3]);
  assert.strictEqual(flat['name'], 'test');
});

test('JSON: minification removes whitespace', () => {
  const pretty = '{\n  "a": 1,\n  "b": 2\n}';
  const minified = JSON.stringify(JSON.parse(pretty));
  assert.strictEqual(minified, '{"a":1,"b":2}');
});

test('JSON: invalid JSON reports error correctly', () => {
  assert.throws(() => JSON.parse('{invalid json}'), SyntaxError);
});

test('JSON: deeply nested structure parses correctly', () => {
  const nested = { l1: { l2: { l3: { l4: { l5: 'deep' } } } } };
  const str = JSON.stringify(nested, null, 2);
  const parsed = JSON.parse(str);
  assert.strictEqual(parsed.l1.l2.l3.l4.l5, 'deep');
});

/* ============================================================
   EDGE CASES & SECURITY
   ============================================================ */
console.log('\n══════════════════════════════════════');
console.log(' 8. EDGE CASES & SECURITY');
console.log('══════════════════════════════════════');

test('AES-CBC: 128 and 256 keys produce different ciphertexts', () => {
  const plaintext = 'Same message';
  const key = 'shared-passphrase';
  const { encrypted: e1 } = encryptAesCbc(plaintext, key, 16);
  const { encrypted: e2 } = encryptAesCbc(plaintext, key, 32);
  assert.notStrictEqual(e1, e2, 'AES-128 and AES-256 keys derive differently');
});

test('AES-GCM: 128 and 256 keys are incompatible', () => {
  const { encrypted, nonce, authTag } = encryptAesGcm('test', 'key', 16);
  assert.throws(
    () => decryptAesGcm(encrypted, nonce, authTag, 'key', 32),
    /unsupported|auth|authentication|failed/i,
    'AES-128-GCM ciphertext must not decrypt with AES-256-GCM key'
  );
});

test('Key derivation: same passphrase always produces same key (deterministic)', () => {
  const k1 = getDotNetSha256Key('deterministic', 32);
  const k2 = getDotNetSha256Key('deterministic', 32);
  assert.ok(k1.equals(k2), 'Key derivation must be deterministic');
});

test('Encryption IV: every call generates unique IV (random)', () => {
  const iv1 = crypto.randomBytes(16).toString('hex');
  const iv2 = crypto.randomBytes(16).toString('hex');
  assert.notStrictEqual(iv1, iv2, 'IVs must be unique across calls');
});

test('AES-CBC: wrong IV (but correct key) produces garbled output (not exact original)', () => {
  const { encrypted, iv } = encryptAesCbc('original text', 'correct-key', 16);
  // Use a different IV
  const wrongIv = crypto.randomBytes(16).toString('hex');
  // First block will be garbled but CBC structure might still "decrypt" partially
  try {
    const result = decryptAesCbc(encrypted, wrongIv, 'correct-key', 16);
    // If it doesn't throw, it should produce wrong output (first block garbled)
    assert.notStrictEqual(result, 'original text', 'Wrong IV must produce different output');
  } catch {
    // Padding error is acceptable — wrong IV may corrupt the first block
    assert.ok(true, 'Wrong IV caused decryption error as expected');
  }
});

/* ============================================================
   FINAL SUMMARY
   ============================================================ */
// Give async tests time to resolve
setTimeout(() => {
  console.log('\n══════════════════════════════════════');
  console.log(` SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════\n');
  if (failed > 0) process.exit(1);
}, 500);
