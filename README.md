# TextWizard (DevWizard V4) 🧙‍♂️⚡

> **High-Performance, 100% Client-Side Developer Utility & Cryptography Suite**  
> Fast, privacy-first, in-browser developer toolset built with React 18, Vanilla CSS design tokens, and the native Web Cryptography API. Zero data leaves your device.

---

## 🌟 Overview

**TextWizard** (also known as **DevWizard V4**) is a modern, privacy-focused engineering workbench engineered for developers, DevOps engineers, and security analysts. Unlike conventional online converters and formatting tools that transmit sensitive tokens, logs, and payloads to third-party cloud servers, **TextWizard runs every single computation locally within the user's browser memory**.

From enterprise-grade AES cryptographic operations and JWT decoding to telecom-spec GSM 03.38 SMS segment packing, TextWizard consolidates essential daily developer utilities into a unified, distraction-free environment.

---

## 🛡️ Core Security & Privacy Philosophy

- **Zero Server Telemetry:** No user payloads, keys, tokens, or documents are ever logged, cached, or transmitted across the wire.
- **Native Web Cryptography API:** Uses standard `window.crypto.subtle` for hardware-accelerated cryptographic primitives.
- **Dynamic Key Management:** Encryption keys are ephemeral, held strictly in memory during execution, and never persisted to `localStorage` or external stores.
- **Offline Capable:** Full client-side execution allows tools to run with zero network roundtrips after initial bundle load.

---

## 🚀 Feature Matrix & Tool Suite

### 🔐 1. Security & Cryptography Studio
* **AES-128 & AES-256 (CBC Mode):** PKCS7 padding, cryptographically secure 16-byte random IV, and SHA-256 key derivation matching .NET (`GetEncryption` / `generateIVNew`) backend conventions.
* **AES-128 & AES-256 (GCM Mode):** Authenticated encryption with 12-byte random nonce and 128-bit authentication tag for integrity verification.
* **Dynamic Key Provisioning:** Selectable algorithm (`AES-CBC` / `AES-GCM`), key size (`128` / `256`), and dynamic user-provided keys.
* **Legacy & Specialty Ciphers:** PBKDF2-derived AES-GCM (100k rounds), Adobe AEM CryptoSupport format, RC4 stream cipher, multi-byte XOR, Caesar shift, and ROT13.
* **Cryptographic Hash Generator:** Instant hashing with MD5, SHA-1, SHA-256, and SHA-512.
* **JWT Token Decoder:** Real-time decoding of header and payload claims, expiration (`exp`/`iat`) validation, and signature inspection.
* **Visual RegEx Builder & Tester:** Modular rule constructor with live pattern matching, capture groups, and code generation for JS, Python, Java, Go, and C#.
* **Unix Timestamp Converter:** Epoch conversion across seconds, milliseconds, microseconds, and nanoseconds with synchronized live UTC and Indian Standard Time (IST) clocks.

### 📦 2. Encoding & Telecom Studio
* **Base64 Multi-Media Studio:** Comprehensive encoder and decoder supporting plain text, images (PNG/JPEG), PDFs, audio, and video files with in-browser previews and Data URI generation.
* **GSM 03.38 7-Bit SMS Analyzer:** Character validator, PDU octet packing calculator, multi-part segment estimator, and automatic UCS-2 fallback detection for telecom platforms (Twilio, Sinch, Infobip).
* **URL Encoder / Decoder:** RFC 3986 percent-encoding and decoding for query strings, URI components, and paths.
* **HTML Entity Encoder / Decoder:** Safe sanitization and escaping of markup characters (`<`, `>`, `&`, `"`, `'`) to mitigate XSS vulnerabilities.

### 📊 3. JSON, XML & Data Transformation
* **JSON Formatter & Validator:** Prettify, format, minify, and inspect JSON payloads with real-time syntax error line tracking.
* **JSON Tree Viewer:** Interactive hierarchical tree explorer with collapsible nodes, dynamic key/value filtering, and clipboard path copying.
* **JSON Converter:** Seamless bidirectional conversion from JSON to CSV (with deep object flattening), YAML, and XML.
* **String ⇄ JSON Converter:** Unescape CloudWatch/Datadog serialized log strings into structured JSON, or escape JSON objects for C#, Java, Python, and SQL strings.
* **XML Formatter:** Strict XML schema validation, tag matching, formatting, and minification powered by `fast-xml-parser`.

### 📝 4. Text & Code Diff Utilities
* **Side-by-Side Visual Diff:** Synchronized scrolling text and code diffing with word-level and character-level difference highlighting.
* **Text Transformation Studio:** Case conversions (UPPERCASE, lowercase, camelCase, snake_case, kebab-case), sorting (A–Z / Z–A), whitespace trimming, and line deduplication.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Functional Components, Hooks) |
| **Routing** | React Router DOM v6 |
| **Styling** | Custom Vanilla CSS (Design Tokens, Glassmorphism, Theme Variables) |
| **Icons** | Lucide React (`lucide-react`) |
| **Cryptography** | Web Crypto API (`crypto.subtle`), SHA-256 digest, AES-GCM / AES-CBC |
| **Parsing & Processing** | `fast-xml-parser`, `js-yaml`, `papaparse`, `diff` |
| **Editor** | Monaco Editor React (`@monaco-editor/react`) |
| **Tooling** | Create React App / Webpack 5 |

---

## 💻 Getting Started Locally

### Prerequisites
* **Node.js**: v16.x or higher (Node 18+ recommended)
* **npm**: v8.x or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lakshya-Purohit/TextWizard.git
   cd TextWizard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Create a production build:**
   ```bash
   npm run build
   ```

---

## 👨‍💻 About the Developer

**TextWizard** is designed, engineered, and maintained by **Lakshya Purohit**.

* **Role:** Full-Stack & Frontend Engineer
* **Location:** Jaipur, Rajasthan, India
* **Email:** [lakshya.purohit.2105@gmail.com](mailto:lakshya.purohit.2105@gmail.com)
* **Phone:** [+91-8302457751](tel:+918302457751)
* **GitHub:** [@Lakshya-Purohit](https://github.com/Lakshya-Purohit)
* **LinkedIn:** [Lakshya Purohit](https://www.linkedin.com/in/lakshya-purohit-a472a6200/)
* **Portfolio:** [lakshyapurohit.online](https://www.lakhsyapurohit.online)

> *"Passionate about crafting high-performance, developer-first web applications with clean design aesthetics, privacy-preserving client-side architecture, and robust cryptographic standards."*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial developer workflows.
