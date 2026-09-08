import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';

/**
 * DevWizard V4 — Universal Data Transformation Engine
 */

export const CONVERTERS = {
  // JSON -> YAML
  'json-yaml': (input) => {
    const obj = typeof input === 'string' ? JSON.parse(input) : input;
    return yaml.dump(obj, { indent: 2, lineWidth: -1, noRefs: true });
  },

  // YAML -> JSON
  'yaml-json': (input, indent = 2) => {
    const obj = yaml.load(input);
    return JSON.stringify(obj, null, indent);
  },

  // JSON -> XML
  'json-xml': (input) => {
    const obj = typeof input === 'string' ? JSON.parse(input) : input;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false
    });
    const wrapped = typeof obj === 'object' && obj !== null && !Array.isArray(obj) && Object.keys(obj).length === 1
      ? obj
      : { root: obj };
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(wrapped);
  },

  // XML -> JSON
  'xml-json': (input, indent = 2) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      trimValues: true
    });
    const parsed = parser.parse(input);
    return JSON.stringify(parsed, null, indent);
  },

  // JSON -> CSV (with recursive flattening)
  'json-csv': (input, options = {}) => {
    let data = typeof input === 'string' ? JSON.parse(input) : input;
    if (!Array.isArray(data)) {
      data = [data];
    }
    const delimiter = options.delimiter || '.';
    const flattened = data.map(item => {
      if (item !== null && typeof item === 'object') {
        return flattenObject(item, '', {}, delimiter);
      }
      return { value: item };
    });
    return Papa.unparse(flattened);
  },

  // CSV -> JSON
  'csv-json': (input, options = {}) => {
    const indent = typeof options === 'number' ? options : (options?.indent ?? 2);
    const result = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
    if (result.errors && result.errors.length > 0 && result.data.length === 0) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }
    return JSON.stringify(result.data, null, indent);
  },

  // XML -> CSV
  'xml-csv': (input) => {
    const parser = new XMLParser({ ignoreAttributes: false });
    let parsed = parser.parse(input);
    if (parsed.root) parsed = parsed.root;
    const arrayData = Array.isArray(parsed) ? parsed : [parsed];
    const flattened = arrayData.map(item => {
      if (item !== null && typeof item === 'object') {
        return flattenObject(item);
      }
      return { value: item };
    });
    return Papa.unparse(flattened);
  },

  // CSV -> XML
  'csv-xml': (input) => {
    const result = Papa.parse(input, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: '  ' });
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build({ root: { item: result.data } });
  },

  // String -> JSON
  'string-json': (input, options = {}) => {
    const trimmed = input.trim();
    const indent = typeof options === 'number' ? options : (options?.indent ?? 2);
    try {
      const parsedOnce = JSON.parse(trimmed);
      if (typeof parsedOnce === 'string') {
        try {
          const parsedTwice = JSON.parse(parsedOnce);
          return JSON.stringify(parsedTwice, null, indent);
        } catch {
          return JSON.stringify(parsedOnce, null, indent);
        }
      }
      return JSON.stringify(parsedOnce, null, indent);
    } catch {
      try {
        const unescaped = trimmed
          .replace(/^"|"$/g, '')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t');
        const parsed = JSON.parse(unescaped);
        return JSON.stringify(parsed, null, indent);
      } catch {
        const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const isKeyValue = lines.every(l => l.includes(':') || l.includes('='));
        if (isKeyValue && lines.length > 0) {
          const obj = {};
          lines.forEach(l => {
            const sep = l.includes(':') ? ':' : '=';
            const [k, ...v] = l.split(sep);
            obj[k.trim()] = v.join(sep).trim();
          });
          return JSON.stringify(obj, null, indent);
        }
        return JSON.stringify(lines, null, indent);
      }
    }
  },

  // JSON -> String
  'json-string': (input, options = {}) => {
    let obj;
    try {
      obj = typeof input === 'string' ? JSON.parse(input) : input;
    } catch {
      obj = input;
    }
    const format = options.format || 'escaped';
    const stringified = typeof obj === 'string' ? obj : JSON.stringify(obj);

    if (format === 'js' || format === 'javascript') {
      return `const jsonString = ${JSON.stringify(stringified)};`;
    }
    if (format === 'java') {
      const escaped = stringified.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `String json = "${escaped}";`;
    }
    if (format === 'python') {
      return `json_string = """${stringified}"""`;
    }
    if (format === 'csharp') {
      const escaped = stringified.replace(/"/g, '""');
      return `string json = @"${escaped}";`;
    }
    return JSON.stringify(stringified);
  },

  // GSM 03.38 Encode (Text -> Hex Octets)
  'gsm-encode': (input) => textToGsm7BitHex(input),

  // GSM 03.38 Decode (Hex Octets -> Text)
  'gsm-decode': (input) => gsm7BitHexToText(input),

  // Text -> Base64
  'text-base64': (input) => {
    const bytes = new TextEncoder().encode(input);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  },

  // Base64 -> Text
  'base64-text': (input) => {
    const clean = input.trim().replace(/[\s\r\n]+/g, '');
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
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
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  'html-decode': (input) => {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent || '';
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
  const opts = typeof options === 'number' ? { indent: options } : options;
  return converter(input, opts);
}

/**
 * Recursive object flattener for JSON to CSV conversion
 */
export function flattenObject(obj, prefix = '', res = {}, delimiter = '.') {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  for (const key of Object.keys(obj)) {
    const propName = prefix ? `${prefix}${delimiter}${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      flattenObject(val, propName, res, delimiter);
    } else if (Array.isArray(val)) {
      const allPrimitives = val.every(item => item === null || typeof item !== 'object');
      if (allPrimitives) {
        res[propName] = val.join(', ');
      } else {
        res[propName] = JSON.stringify(val);
      }
    } else {
      res[propName] = val;
    }
  }
  return res;
}

/**
 * GSM 03.38 Constants and Helpers
 */
export const GSM_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ' +
  ' !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§' +
  '¿abcdefghijklmnopqrstuvwxyzäöñüà';

export const GSM_EXTENSION = {
  '\f': 0x0A,
  '^': 0x14,
  '{': 0x28,
  '}': 0x29,
  '\\': 0x2F,
  '[': 0x3C,
  '~': 0x3D,
  ']': 0x3E,
  '|': 0x40,
  '€': 0x65,
};

export function textToGsm7BitHex(text) {
  const septets = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (GSM_EXTENSION[ch] !== undefined) {
      septets.push(0x1B);
      septets.push(GSM_EXTENSION[ch]);
    } else {
      const idx = GSM_BASIC.indexOf(ch);
      if (idx !== -1) {
        septets.push(idx);
      } else {
        septets.push(0x3F);
      }
    }
  }

  const octets = [];
  let bitBuffer = 0;
  let bitCount = 0;

  for (let i = 0; i < septets.length; i++) {
    bitBuffer |= (septets[i] & 0x7F) << bitCount;
    bitCount += 7;

    while (bitCount >= 8) {
      octets.push(bitBuffer & 0xFF);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  if (bitCount > 0) {
    octets.push(bitBuffer & 0xFF);
  }

  return octets.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

export function gsm7BitHexToText(hex) {
  const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
  const octets = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    octets.push(parseInt(cleanHex.substr(i, 2), 16));
  }

  const septets = [];
  let bitBuffer = 0;
  let bitCount = 0;

  for (let i = 0; i < octets.length; i++) {
    bitBuffer |= (octets[i] << bitCount);
    bitCount += 8;

    while (bitCount >= 7) {
      septets.push(bitBuffer & 0x7F);
      bitBuffer >>= 7;
      bitCount -= 7;
    }
  }

  const EXT_LOOKUP = {};
  for (const [k, v] of Object.entries(GSM_EXTENSION)) {
    EXT_LOOKUP[v] = k;
  }

  let text = '';
  for (let i = 0; i < septets.length; i++) {
    const s = septets[i];
    if (s === 0x1B && i + 1 < septets.length) {
      i++;
      text += EXT_LOOKUP[septets[i]] || '?';
    } else if (s < GSM_BASIC.length) {
      text += GSM_BASIC[s];
    } else {
      text += '?';
    }
  }
  return text;
}

export default transform;
