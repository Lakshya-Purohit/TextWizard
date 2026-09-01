import { lazy } from 'react';
import {
  Braces, FileJson, TreePine, ArrowLeftRight,
  FileCode2,
  Type, CaseSensitive,
  Binary, Link, Code2,
  KeyRound, Hash, Regex, Clock,
  GitCompare,
} from 'lucide-react';

/* ============================================
   Tool Category Definitions
   ============================================ */
export const CATEGORIES = {
  json: {
    id: 'json',
    name: 'JSON',
    icon: Braces,
    color: 'var(--cat-json)',
    description: 'JSON formatting, validation, and conversion',
  },
  xml: {
    id: 'xml',
    name: 'XML',
    icon: FileCode2,
    color: 'var(--cat-xml)',
    description: 'XML formatting and conversion',
  },
  text: {
    id: 'text',
    name: 'Text',
    icon: Type,
    color: 'var(--cat-text)',
    description: 'Text transformation utilities',
  },
  encoding: {
    id: 'encoding',
    name: 'Encoding',
    icon: Binary,
    color: 'var(--cat-encoding)',
    description: 'Encoding and decoding tools',
  },
  dev: {
    id: 'dev',
    name: 'Dev Tools',
    icon: KeyRound,
    color: 'var(--cat-dev)',
    description: 'Developer debugging utilities',
  },
  diff: {
    id: 'diff',
    name: 'Diff',
    icon: GitCompare,
    color: 'var(--cat-diff)',
    description: 'Compare and diff tools',
  },
};

/* ============================================
   Tool Definitions
   ============================================ */
const tools = [
  // ---- JSON ----
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'json',
    icon: Braces,
    description: 'Format, minify, and validate JSON with syntax highlighting',
    keywords: ['format', 'beautify', 'prettify', 'json', 'minify', 'validate'],
    component: lazy(() => import('./json/JsonFormatter')),
  },
  {
    id: 'json-tree',
    name: 'JSON Tree Viewer',
    category: 'json',
    icon: TreePine,
    description: 'Explore JSON as a collapsible tree structure',
    keywords: ['tree', 'viewer', 'explorer', 'json', 'node', 'hierarchy'],
    component: lazy(() => import('./json/JsonTreeViewer')),
  },
  {
    id: 'json-converter',
    name: 'JSON Converter',
    category: 'json',
    icon: ArrowLeftRight,
    description: 'Convert JSON to XML, YAML, or CSV',
    keywords: ['convert', 'json', 'xml', 'yaml', 'csv', 'transform'],
    component: lazy(() => import('./json/JsonConverter')),
  },

  // ---- XML ----
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: 'xml',
    icon: FileCode2,
    description: 'Format, minify, and validate XML documents',
    keywords: ['xml', 'format', 'beautify', 'prettify', 'minify', 'validate'],
    component: lazy(() => import('./xml/XmlFormatter')),
  },

  // ---- Text ----
  {
    id: 'text-transform',
    name: 'Text Transform',
    category: 'text',
    icon: CaseSensitive,
    description: 'Case conversion, sorting, deduplication, and more',
    keywords: ['text', 'uppercase', 'lowercase', 'case', 'sort', 'trim', 'reverse', 'deduplicate'],
    component: lazy(() => import('./text/TextTransform')),
  },

  // ---- Encoding ----
  {
    id: 'base64',
    name: 'Base64 Encoder',
    category: 'encoding',
    icon: Binary,
    description: 'Encode and decode Base64 text and files',
    keywords: ['base64', 'encode', 'decode', 'binary', 'file'],
    component: lazy(() => import('./encoding/Base64Tool')),
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    category: 'encoding',
    icon: Link,
    description: 'URL encode and decode strings',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri'],
    component: lazy(() => import('./encoding/UrlEncoder')),
  },
  {
    id: 'html-encoder',
    name: 'HTML Encoder',
    category: 'encoding',
    icon: Code2,
    description: 'HTML entity encode and decode',
    keywords: ['html', 'encode', 'decode', 'entity', 'escape'],
    component: lazy(() => import('./encoding/HtmlEncoder')),
  },

  // ---- Dev Tools ----
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'dev',
    icon: KeyRound,
    description: 'Decode JWT tokens, inspect header, payload, and signature',
    keywords: ['jwt', 'token', 'decode', 'claims', 'bearer', 'auth'],
    component: lazy(() => import('./dev/JwtDecoder')),
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: 'dev',
    icon: Hash,
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    keywords: ['hash', 'md5', 'sha', 'checksum', 'digest', 'crypto'],
    component: lazy(() => import('./dev/HashGenerator')),
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    category: 'dev',
    icon: Regex,
    description: 'Test regular expressions with live match highlighting',
    keywords: ['regex', 'regexp', 'regular expression', 'match', 'test', 'pattern'],
    component: lazy(() => import('./dev/RegexTester')),
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: 'dev',
    icon: Clock,
    description: 'Convert between Unix timestamps and human-readable dates',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
    component: lazy(() => import('./dev/TimestampConverter')),
  },

  // ---- Diff ----
  {
    id: 'text-diff',
    name: 'Text Diff',
    category: 'diff',
    icon: GitCompare,
    description: 'Compare two texts side-by-side or unified view',
    keywords: ['diff', 'compare', 'text', 'merge', 'changes', 'side by side'],
    component: lazy(() => import('./diff/TextDiff')),
  },
];

/* ============================================
   Registry API
   ============================================ */
export function getAllTools() {
  return tools;
}

export function getToolById(id) {
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
