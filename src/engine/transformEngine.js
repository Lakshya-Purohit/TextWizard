import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';

/**
 * Universal Data Transformation Engine
 */

export const CONVERTERS = {
  // JSON -> YAML
  'json-yaml': (input) => {
    const obj = typeof input === 'string' ? JSON.parse(input) : input;
    return yaml.dump(obj, { indent: 2, lineWidth: -1 });
  },

  // YAML -> JSON
  'yaml-json': (input, indent = 2) => {
    const obj = yaml.load(input);
    return JSON.stringify(obj, null, indent);
  },

  // JSON -> XML
  'json-xml': (input) => {
    const obj = typeof input === 'string' ? JSON.parse(input) : input;
    // fast-xml-parser builder
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false
    });
    // Ensure root object
    const wrapped = typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 1
      ? obj
      : { root: obj };
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(wrapped);
  },

  // XML -> JSON
  'xml-json': (input, indent = 2) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true
    });
    const parsed = parser.parse(input);
    return JSON.stringify(parsed, null, indent);
  },

  // JSON -> CSV
  'json-csv': (input) => {
    let data = typeof input === 'string' ? JSON.parse(input) : input;
    if (!Array.isArray(data)) {
      data = [data];
    }
    return Papa.unparse(data);
  },

  // CSV -> JSON
  'csv-json': (input, indent = 2) => {
    const result = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
    if (result.errors && result.errors.length > 0 && result.data.length === 0) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }
    return JSON.stringify(result.data, null, indent);
  },

  // XML -> CSV (via XML -> JSON -> CSV)
  'xml-csv': (input) => {
    const parser = new XMLParser({ ignoreAttributes: false });
    let parsed = parser.parse(input);
    if (parsed.root) parsed = parsed.root;
    const arrayData = Array.isArray(parsed) ? parsed : [parsed];
    return Papa.unparse(arrayData);
  },

  // CSV -> XML (via CSV -> JSON -> XML)
  'csv-xml': (input) => {
    const result = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: '  ' });
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build({ root: { item: result.data } });
  },

  // Text -> Base64
  'text-base64': (input) => {
    return btoa(unescape(encodeURIComponent(input)));
  },

  // Base64 -> Text
  'base64-text': (input) => {
    return decodeURIComponent(escape(atob(input.trim())));
  },

  // Text -> Hex
  'text-hex': (input) => {
    return Array.from(new TextEncoder().encode(input))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  },

  // Hex -> Text
  'hex-text': (input) => {
    const cleanHex = input.replace(/[^0-9a-fA-F]/g, '');
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  },

  // Text -> Binary
  'text-binary': (input) => {
    return Array.from(new TextEncoder().encode(input))
      .map(b => b.toString(2).padStart(8, '0'))
      .join(' ');
  },

  // Binary -> Text
  'binary-text': (input) => {
    const cleanBin = input.replace(/[^01]/g, '');
    const bytes = [];
    for (let i = 0; i < cleanBin.length; i += 8) {
      const byteStr = cleanBin.substr(i, 8);
      if (byteStr.length === 8) {
        bytes.push(parseInt(byteStr, 2));
      }
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  },

  // URL Encode / Decode
  'url-encode': (input) => encodeURIComponent(input),
  'url-decode': (input) => decodeURIComponent(input),

  // HTML Entity Encode / Decode
  'html-encode': (input) => {
    const textarea = document.createElement('textarea');
    textarea.innerText = input;
    return textarea.innerHTML;
  },
  'html-decode': (input) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
  }
};

/**
 * Universal transform function
 */
export function transform(input, conversionType, options = {}) {
  if (!input || !input.trim()) return '';
  const converter = CONVERTERS[conversionType];
  if (!converter) {
    throw new Error(`Converter "${conversionType}" not found`);
  }
  return converter(input, options.indent);
}

/**
 * Magic detection of input type
 */
export function detectFormat(input) {
  if (!input || typeof input !== 'string') return 'unknown';
  const trimmed = input.trim();

  // JWT
  if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(trimmed) && trimmed.split('.').length === 3) {
    return 'jwt';
  }

  // JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // not valid JSON
    }
  }

  // XML / HTML
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return 'xml';
  }

  // Base64
  if (/^[A-Za-z0-9+/=]{8,}$/.test(trimmed) && trimmed.length % 4 === 0) {
    try {
      if (atob(trimmed)) return 'base64';
    } catch {}
  }

  // URL
  if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
    return 'url';
  }

  // Timestamp
  if (/^\d{10}(\d{3})?$/.test(trimmed)) {
    return 'timestamp';
  }

  return 'text';
}

export default transform;
