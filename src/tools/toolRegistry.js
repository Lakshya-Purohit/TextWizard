import { lazy } from 'react';
import {
  Braces, TreePine, ArrowLeftRight, Quote,
  FileCode2,
  Type, CaseSensitive,
  Binary, Link, Code2,
  KeyRound, Hash, Regex, Clock,
  GitCompare, Wand2, Smartphone, ShieldCheck, Layers
} from 'lucide-react';

/* ============================================
   Tool Category Definitions
   ============================================ */
export const CATEGORIES = {
  json: {
    id: 'json',
    name: 'JSON',
    icon: Braces,
    color: 'var(--accent-gold)',
    description: 'Format, validate, inspect, and convert JSON structures',
  },
  xml: {
    id: 'xml',
    name: 'XML',
    icon: FileCode2,
    color: 'var(--accent-gold)',
    description: 'XML syntax validation, formatting, and minification',
  },
  text: {
    id: 'text',
    name: 'Text',
    icon: Type,
    color: 'var(--accent-gold)',
    description: 'Case transformations, sorting, and line deduplication',
  },
  encoding: {
    id: 'encoding',
    name: 'Encoding',
    icon: Binary,
    color: 'var(--accent-gold)',
    description: 'Base64 studio, GSM 03.38 SMS, URL, and HTML entities',
  },
  dev: {
    id: 'dev',
    name: 'Security & Dev',
    icon: KeyRound,
    color: 'var(--accent-gold)',
    description: 'Cryptography, JWT decoder, RegEx builder, timestamps, and hashes',
  },
  diff: {
    id: 'diff',
    name: 'Diff & Compare',
    icon: GitCompare,
    color: 'var(--accent-gold)',
    description: 'Side-by-side visual difference and line/word comparisons',
  },
};

/* ============================================
   Tool Definitions with FAQs & AEO Context
   ============================================ */
const tools = [
  // ---- JSON Category — Unified JSON Studio ----
  {
    id: 'json-studio',
    name: 'JSON Studio',
    category: 'json',
    icon: Layers,
    description: 'All-in-one JSON workspace: format & validate, interactive tree inspector, escape/unescape log strings (CloudWatch, Java, Python, C#), and convert to YAML, CSV, XML, and String.',
    keywords: ['json', 'format', 'validate', 'beautify', 'prettify', 'minify', 'tree', 'viewer', 'explorer', 'hierarchy', 'jsonpath', 'convert', 'yaml', 'csv', 'xml', 'string', 'escape', 'unescape', 'log', 'cloudwatch', 'java', 'python', 'csharp', 'repair', 'sort keys'],
    relatedTools: ['xml-formatter', 'cipher-crypto', 'text-diff'],
    component: lazy(() => import('./json/JsonStudio')),
    faqs: [
      {
        question: 'What does JSON Studio include?',
        answer: 'JSON Studio consolidates four separate JSON tools into one: (1) Format & Validate with auto-repair of common errors, (2) Interactive Tree Inspector with collapsible nodes and JSONPath copying, (3) Stringify & Log Unescaper for Java/Python/C#/CloudWatch log strings, and (4) Bidirectional converter to/from YAML, CSV, XML, and escaped Strings.'
      },
      {
        question: 'How do I unescape JSON from CloudWatch or Datadog logs?',
        answer: 'Switch to the "Stringify & Logs" tab, select "Unescape Logs → JSON" mode, and paste your log snippet. DevWizard strips escaped quotes and extracts embedded JSON, formatting it cleanly.'
      },
      {
        question: 'Is my JSON data sent to any server?',
        answer: 'No. All parsing, formatting, conversion, and tree rendering executes 100% locally in your browser JavaScript engine. No data leaves your device.'
      }
    ]
  },
  // Backward-compat aliases so existing deep links to old tool IDs still work (hidden from sidebar nav)
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'json',
    icon: Braces,
    hidden: true,
    description: 'Format, validate, and minify JSON — now part of JSON Studio.',
    keywords: ['json', 'format', 'validate', 'minify'],
    relatedTools: ['json-studio'],
    component: lazy(() => import('./json/JsonStudio')),
    faqs: []
  },
  {
    id: 'json-tree',
    name: 'JSON Tree Viewer',
    category: 'json',
    icon: TreePine,
    hidden: true,
    description: 'Interactive JSON tree inspector — now part of JSON Studio.',
    keywords: ['json', 'tree', 'viewer', 'explorer'],
    relatedTools: ['json-studio'],
    component: lazy(() => import('./json/JsonStudio')),
    faqs: []
  },
  {
    id: 'json-converter',
    name: 'JSON Converter',
    category: 'json',
    icon: ArrowLeftRight,
    hidden: true,
    description: 'Convert JSON to YAML, CSV, XML — now part of JSON Studio.',
    keywords: ['json', 'convert', 'yaml', 'csv', 'xml'],
    relatedTools: ['json-studio'],
    component: lazy(() => import('./json/JsonStudio')),
    faqs: []
  },
  {
    id: 'string-json',
    name: 'String ⇄ JSON',
    category: 'json',
    icon: Quote,
    hidden: true,
    description: 'Escape and unescape JSON log strings — now part of JSON Studio.',
    keywords: ['json', 'escape', 'unescape', 'log', 'string'],
    relatedTools: ['json-studio'],
    component: lazy(() => import('./json/JsonStudio')),
    faqs: []
  },

  // ---- XML Category ----
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: 'xml',
    icon: FileCode2,
    description: 'Format, validate, prettify, and minify XML documents with robust XML schema syntax validation.',
    keywords: ['xml', 'format', 'beautify', 'prettify', 'minify', 'validate', 'schema', 'fast-xml-parser'],
    relatedTools: ['json-converter', 'text-diff'],
    component: lazy(() => import('./xml/XmlFormatter')),
    faqs: [
      {
        question: 'Does this XML formatter detect unclosed tags or mismatched attributes?',
        answer: 'Yes. It performs strict XML validation and provides exact error feedback if tags are unclosed or mismatched.'
      }
    ]
  },

  // ---- Text Category ----
  {
    id: 'text-transform',
    name: 'Text Transform',
    category: 'text',
    icon: CaseSensitive,
    description: 'Transform text case (UPPERCASE, lowercase, camelCase, snake_case, kebab-case), sort lines, and deduplicate.',
    keywords: ['text', 'uppercase', 'lowercase', 'case', 'sort', 'trim', 'reverse', 'deduplicate', 'camelcase', 'snake_case', 'kebab-case'],
    relatedTools: ['text-diff', 'base64'],
    component: lazy(() => import('./text/TextTransform')),
    faqs: [
      {
        question: 'What text operations are supported?',
        answer: 'Case conversions (Upper, Lower, Title, Sentence, Camel, Snake, Kebab), line operations (Sort A-Z/Z-A, Deduplicate, Trim, Remove Empty), and string reversal.'
      }
    ]
  },

  // ---- Encoding Category ----
  {
    id: 'gsm-encoder',
    name: 'GSM 7-bit & SMS Encoder',
    category: 'encoding',
    icon: Smartphone,
    description: 'GSM 03.38 7-bit SMS character validator, hex octet PDU packing, segment calculator, and Unicode UCS-2 detector.',
    keywords: ['gsm', 'sms', '7-bit', 'telecom', 'pdu', '03.38', 'encode', 'decode', 'segments', 'twilio', 'sinch', 'infobip', 'ucs-2'],
    relatedTools: ['base64', 'url-encoder'],
    component: lazy(() => import('./encoding/GsmEncoder')),
    faqs: [
      {
        question: 'Why does my SMS split into multiple messages?',
        answer: 'Standard GSM 7-bit SMS messages hold up to 160 characters (153 for concatenated multi-part messages). If you include non-GSM characters like emojis or special accents, telecom carriers switch to UCS-2 encoding which limits each segment to 70 characters (67 for multi-part).'
      }
    ]
  },
  {
    id: 'base64',
    name: 'Base64 Studio',
    category: 'encoding',
    icon: Binary,
    description: 'Complete Base64 tool: Text, PDF, PNG/JPEG Images, Audio, Video & Files with live preview and Data URI generator.',
    keywords: ['base64', 'pdf', 'image', 'video', 'audio', 'file', 'media', 'data uri', 'png', 'jpg', 'mp4', 'convert', 'preview', 'download', 'encode', 'decode', 'binary', 'hex'],
    relatedTools: ['url-encoder', 'html-encoder', 'cipher-crypto'],
    component: lazy(() => import('./encoding/Base64Studio')),
    faqs: [
      {
        question: 'Can I preview PDF and images directly from Base64 strings?',
        answer: 'Yes. Base64 Studio renders live previews of images, PDFs, audio, and video files directly in your browser and lets you download the reconstructed binary file.'
      }
    ]
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder & Decoder',
    category: 'encoding',
    icon: Link,
    description: 'Encode and decode URL query parameters, paths, and special URI characters.',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'querystring', 'rfc3986'],
    relatedTools: ['html-encoder', 'base64'],
    component: lazy(() => import('./encoding/UrlEncoder')),
    faqs: [
      {
        question: 'What is percent encoding in URLs?',
        answer: 'Percent encoding replaces unsafe ASCII characters with a % followed by their two-digit hexadecimal value (e.g. spaces become %20) so they can be safely transmitted across HTTP requests.'
      }
    ]
  },
  {
    id: 'html-encoder',
    name: 'HTML Entity Encoder',
    category: 'encoding',
    icon: Code2,
    description: 'Escape and unescape HTML entities (&, <, >, ", \') to prevent XSS and preserve markup.',
    keywords: ['html', 'encode', 'decode', 'entity', 'escape', 'xss', 'sanitize'],
    relatedTools: ['url-encoder', 'string-json'],
    component: lazy(() => import('./encoding/HtmlEncoder')),
    faqs: [
      {
        question: 'Why should I escape HTML entities?',
        answer: 'Escaping converts special characters like < and > into &lt; and &gt;, ensuring they are rendered as text rather than executable markup, mitigating XSS security vulnerabilities.'
      }
    ]
  },

  // ---- Dev Tools & Security Category ----
  {
    id: 'cipher-crypto',
    name: 'Cipher & Encryption Studio',
    category: 'dev',
    icon: KeyRound,
    description: 'Client-side AES-128/256 encryption in CBC (PKCS7) and GCM (authenticated) modes with SHA-256 key derivation, plus PBKDF2 AES-GCM, Adobe AEM CryptoSupport, RC4, XOR, Caesar, and ROT13 ciphers.',
    keywords: ['aes', 'gcm', 'cbc', '128', '256', 'aem', 'crypto', 'encrypt', 'decrypt', 'cipher', 'secret', 'adobe', 'rc4', 'xor', 'caesar', 'rot13', 'pkcs7', 'backend', 'sha256'],
    relatedTools: ['jwt-decoder', 'hash-generator'],
    component: lazy(() => import('./dev/CipherCryptoTool')),
    faqs: [
      {
        question: 'Is AES-GCM encryption secure in DevWizard?',
        answer: 'Yes. It uses the native Web Cryptography API (`crypto.subtle`) with 128 or 256-bit AES-GCM and a 12-byte random nonce with 128-bit authentication tag. All operations occur locally in memory.'
      },
      {
        question: 'What is the difference between AES-CBC and AES-GCM?',
        answer: 'AES-CBC provides confidentiality with PKCS7 padding and a random 16-byte IV. AES-GCM additionally provides authentication — it detects any tampering with the ciphertext via a 128-bit authentication tag. GCM is generally preferred for new systems, while CBC is common in legacy .NET and Java backends.'
      },
      {
        question: 'How is the encryption key derived from my passphrase?',
        answer: 'For the backend-compatible AES modes, your passphrase is hashed with SHA-256 and truncated to 16 bytes (AES-128) or 32 bytes (AES-256). This matches the .NET SHA-256 key derivation pattern. The legacy PBKDF2 mode uses 100,000 iterations of PBKDF2-SHA-256 with a random 16-byte salt.'
      }
    ]
  },
  {
    id: 'regex-creator',
    name: 'RegEx Creator & Builder',
    category: 'dev',
    icon: Wand2,
    description: 'Visual regular expression builder with modular rule blocks, human-readable explanations, presets, and live testing.',
    keywords: ['regex', 'creator', 'builder', 'visual', 'regular expression', 'pattern', 'generator', 'cheatsheet'],
    relatedTools: ['regex-tester', 'text-transform'],
    component: lazy(() => import('./dev/RegexCreator')),
    faqs: [
      {
        question: 'Can I generate code snippets for JavaScript, Python, and Java from regex patterns?',
        answer: 'Yes. The RegEx Creator automatically outputs ready-to-use code snippets in JS, Python, Java, Go, and C# for your compiled expression.'
      }
    ]
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Token Decoder',
    category: 'dev',
    icon: ShieldCheck,
    description: 'Inspect JSON Web Tokens (JWT): decode Header, Payload claims, signature, and verify token expiration in real time.',
    keywords: ['jwt', 'token', 'decode', 'claims', 'bearer', 'auth', 'expiration', 'iat', 'exp', 'sub'],
    relatedTools: ['cipher-crypto', 'hash-generator', 'timestamp-converter'],
    component: lazy(() => import('./dev/JwtDecoder')),
    faqs: [
      {
        question: 'Is it safe to paste production JWTs into DevWizard?',
        answer: 'Yes. Unlike cloud-based decoders, DevWizard decodes JWT tokens entirely in your browser using local JavaScript without sending the token over any network.'
      }
    ]
  },
  {
    id: 'hash-generator',
    name: 'Cryptographic Hash Generator',
    category: 'dev',
    icon: Hash,
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes with instant one-click copy.',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'sha512', 'checksum', 'digest', 'crypto'],
    relatedTools: ['cipher-crypto', 'jwt-decoder'],
    component: lazy(() => import('./dev/HashGenerator')),
    faqs: [
      {
        question: 'Which hash algorithm is recommended for security?',
        answer: 'SHA-256 and SHA-512 are modern cryptographic standards recommended for secure checksums and integrity verification. MD5 and SHA-1 should be reserved only for legacy checksum compatibility.'
      }
    ]
  },
  {
    id: 'regex-tester',
    name: 'RegEx Tester',
    category: 'dev',
    icon: Regex,
    description: 'Test regular expressions with live match highlighting, group capturing, and execution safety bounds.',
    keywords: ['regex', 'regexp', 'regular expression', 'match', 'test', 'pattern', 'capture groups', 'flags'],
    relatedTools: ['regex-creator', 'text-transform'],
    component: lazy(() => import('./dev/RegexTester')),
    faqs: [
      {
        question: 'How does match highlighting work?',
        answer: 'DevWizard executes your RegEx against the sample text in real time, highlighting matching spans and displaying individual captured group indices in structured cards.'
      }
    ]
  },
  {
    id: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    category: 'dev',
    icon: Clock,
    description: 'Convert between Unix Epoch timestamps (seconds, ms, μs, ns) and human dates with live IST & UTC clocks.',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert', 'ist', 'india', 'utc', 'iso8601', 'relative time'],
    relatedTools: ['jwt-decoder', 'hash-generator'],
    component: lazy(() => import('./dev/TimestampConverter')),
    faqs: [
      {
        question: 'Does this converter support Indian Standard Time (IST)?',
        answer: 'Yes. DevWizard provides a dedicated live IST clock (Asia/Kolkata, UTC+05:30) and converts any Unix epoch timestamp into IST, UTC, Local Time, ISO-8601, and relative human descriptions.'
      }
    ]
  },

  // ---- Diff Category ----
  {
    id: 'text-diff',
    name: 'Side-by-Side Text Diff',
    category: 'diff',
    icon: GitCompare,
    description: 'Compare two text files or code snippets with side-by-side synchronized scrolling and word-level diff highlights.',
    keywords: ['diff', 'compare', 'text', 'merge', 'changes', 'side by side', 'word diff', 'code diff'],
    relatedTools: ['json-formatter', 'xml-formatter'],
    component: lazy(() => import('./diff/TextDiff')),
    faqs: [
      {
        question: 'Can I compare both word-level and character-level differences?',
        answer: 'Yes. DevWizard lets you toggle between word-level and character-level comparison granularities, ignore whitespace differences, and swap original and modified inputs with one click.'
      }
    ]
  },
];

/* ============================================
   Registry API Functions
   ============================================ */
export function getAllTools() {
  return tools;
}

export function getToolById(id) {
  if (!id) return null;
  if (id === 'base64-file') return tools.find(t => t.id === 'base64');
  return tools.find(t => t.id === id);
}

export function getToolsByCategory(categoryId) {
  return tools.filter(t => t.category === categoryId);
}

export function searchTools(query) {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.keywords.some(k => k.includes(q)) ||
    t.category.includes(q)
  );
}

export function getToolsByIds(ids) {
  return ids.map(id => getToolById(id)).filter(Boolean);
}

export default tools;
