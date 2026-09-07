import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, ArrowLeftRight, FileCode, Sparkles } from 'lucide-react';
import './StringJsonConverter.css';

const SAMPLES = {
  stringToJson: `"{\\"event\\": \\"user_signup\\", \\"userId\\": 9841, \\"meta\\": {\\"source\\": \\"adwords\\", \\"timestamp\\": 1773010942}, \\"tags\\": [\\"pro\\", \\"annual\\"]}"`,
  jsonToString: `{\n  "service": "authentication-gateway",\n  "port": 8080,\n  "enabled": true,\n  "endpoints": [\n    "/api/v1/auth/login",\n    "/api/v1/auth/verify"\n  ],\n  "rateLimit": {\n    "maxRequests": 100,\n    "windowMs": 60000\n  }\n}`,
  multilineString: `user=admin\nrole=developer\nstatus=active\ntimezone=Asia/Kolkata`
};

const StringJsonConverter = () => {
  const { showToast } = useApp();
  const [direction, setDirection] = useState('string-to-json'); // 'string-to-json' | 'json-to-string'
  const [input, setInput] = useState(SAMPLES.stringToJson);

  // String to JSON options
  const [indentSize, setIndentSize] = useState(2);
  const [parseMode, setParseMode] = useState('auto'); // 'auto' | 'unescape-only' | 'lines-array' | 'key-value'

  // JSON to String options
  const [targetLang, setTargetLang] = useState('escaped'); // 'escaped' | 'js' | 'java' | 'python' | 'csharp' | 'sql'
  const [escapeForwardSlashes, setEscapeForwardSlashes] = useState(false);
  const [singleLine, setSingleLine] = useState(true);

  // Switch direction helper
  const handleToggleDirection = (newDir) => {
    setDirection(newDir);
    setInput(newDir === 'string-to-json' ? SAMPLES.stringToJson : SAMPLES.jsonToString);
  };

  const handleLoadSample = (sampleKey) => {
    if (sampleKey === 'multiline') {
      setDirection('string-to-json');
      setInput(SAMPLES.multilineString);
    } else if (sampleKey === 'stringToJson') {
      setDirection('string-to-json');
      setInput(SAMPLES.stringToJson);
    } else {
      setDirection('json-to-string');
      setInput(SAMPLES.jsonToString);
    }
    showToast('Loaded sample into editor', 'info');
  };

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };

    if (direction === 'string-to-json') {
      const trimmed = input.trim();
      try {
        if (parseMode === 'lines-array') {
          const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          return { output: JSON.stringify(lines, null, indentSize), valid: true, error: null };
        }

        if (parseMode === 'key-value') {
          const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const obj = {};
          lines.forEach(line => {
            const sep = line.includes(':') ? ':' : line.includes('=') ? '=' : null;
            if (sep) {
              const [k, ...rest] = line.split(sep);
              obj[k.trim()] = rest.join(sep).trim();
            }
          });
          return { output: JSON.stringify(obj, null, indentSize), valid: true, error: null };
        }

        // Auto mode or unescape-only
        let parsed;
        let attemptUnescape = false;

        try {
          parsed = JSON.parse(trimmed);
          if (typeof parsed === 'string') {
            // It was a stringified JSON string e.g. "{\"a\":1}"
            try {
              parsed = JSON.parse(parsed);
            } catch {
              // It's just a normal string
            }
          }
        } catch {
          attemptUnescape = true;
        }

        if (attemptUnescape || parseMode === 'unescape-only') {
          const clean = trimmed
            .replace(/^"|"$/g, '')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t');
          parsed = JSON.parse(clean);
        }

        const formatted = JSON.stringify(parsed, null, indentSize);
        return { output: formatted, valid: true, error: null };
      } catch (e) {
        // Fallback: if lines exist, try key-value or lines
        try {
          const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length > 1 && lines.every(l => l.includes(':') || l.includes('='))) {
            const obj = {};
            lines.forEach(line => {
              const sep = line.includes(':') ? ':' : '=';
              const [k, ...rest] = line.split(sep);
              obj[k.trim()] = rest.join(sep).trim();
            });
            return { output: JSON.stringify(obj, null, indentSize), valid: true, error: null };
          }
          if (lines.length > 1) {
            return { output: JSON.stringify(lines, null, indentSize), valid: true, error: null };
          }
        } catch {}
        return { output: '', valid: false, error: e.message };
      }
    } else {
      // JSON -> String
      try {
        let obj;
        try {
          obj = JSON.parse(input);
        } catch {
          obj = input;
        }

        let jsonText = singleLine ? JSON.stringify(obj) : JSON.stringify(obj, null, 2);
        if (escapeForwardSlashes) {
          jsonText = jsonText.replace(/\//g, '\\/');
        }

        let output = '';
        if (targetLang === 'escaped') {
          // Standard escaped JSON string literal: "{\"key\":\"value\"}"
          output = JSON.stringify(jsonText);
        } else if (targetLang === 'js') {
          output = `const jsonPayload = ${JSON.stringify(jsonText)};`;
        } else if (targetLang === 'java') {
          const escaped = jsonText.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          output = `String jsonPayload = "${escaped}";`;
        } else if (targetLang === 'python') {
          output = `json_payload = """${jsonText}"""`;
        } else if (targetLang === 'csharp') {
          const escaped = jsonText.replace(/"/g, '""');
          output = `string jsonPayload = @"${escaped}";`;
        } else if (targetLang === 'sql') {
          const escaped = jsonText.replace(/'/g, "''");
          output = `'${escaped}'`;
        } else {
          output = JSON.stringify(jsonText);
        }

        return { output, valid: true, error: null };
      } catch (e) {
        return { output: '', valid: false, error: e.message };
      }
    }
  }, [input, direction, indentSize, parseMode, targetLang, escapeForwardSlashes, singleLine]);

  const toolbar = (
    <div className="sjc-toolbar-controls">
      <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
        <button
          className={`dw-tab ${direction === 'string-to-json' ? 'active' : ''}`}
          onClick={() => handleToggleDirection('string-to-json')}
        >
          String → JSON
        </button>
        <button
          className={`dw-tab ${direction === 'json-to-string' ? 'active' : ''}`}
          onClick={() => handleToggleDirection('json-to-string')}
        >
          JSON → String
        </button>
      </div>

      <div className="sjc-divider" />

      {direction === 'string-to-json' ? (
        <>
          <div className="sjc-select-group">
            <span>Parse Mode:</span>
            <select
              className="sjc-select"
              value={parseMode}
              onChange={(e) => setParseMode(e.target.value)}
            >
              <option value="auto">Auto (Escaped JSON / Detect)</option>
              <option value="unescape-only">Unescape Escaped Quotes (\")</option>
              <option value="key-value">Key: Value Text to Object</option>
              <option value="lines-array">Lines to Array ["line1", ...]</option>
            </select>
          </div>

          <div className="sjc-select-group">
            <span>Indent:</span>
            <select
              className="sjc-select"
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={0}>Compact (Minified)</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="sjc-select-group">
            <span>Language Target:</span>
            <select
              className="sjc-select"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="escaped">Escaped String Literal ("...")</option>
              <option value="js">JavaScript / TypeScript (const json = "...")</option>
              <option value="java">Java String (String json = "...")</option>
              <option value="python">Python Triple-Quote String</option>
              <option value="csharp">C# Verbatim (@"...")</option>
              <option value="sql">SQL Escaped ('...')</option>
            </select>
          </div>

          <label className="sjc-checkbox-label">
            <input
              type="checkbox"
              checked={singleLine}
              onChange={(e) => setSingleLine(e.target.checked)}
            />
            <span>Single Line</span>
          </label>

          <label className="sjc-checkbox-label">
            <input
              type="checkbox"
              checked={escapeForwardSlashes}
              onChange={(e) => setEscapeForwardSlashes(e.target.checked)}
            />
            <span>Escape / to \/</span>
          </label>
        </>
      )}

      <div className="sjc-divider" />

      <div className="dw-btn-group">
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={() => handleLoadSample(direction === 'string-to-json' ? 'stringToJson' : 'jsonToString')}
          title="Load default sample"
        >
          <Sparkles size={12} />
          <span>Sample</span>
        </button>
        {direction === 'string-to-json' && (
          <button
            className="dw-btn dw-btn-ghost dw-btn-sm"
            onClick={() => handleLoadSample('multiline')}
            title="Load key-value text sample"
          >
            <FileCode size={12} />
            <span>Key-Val Sample</span>
          </button>
        )}
      </div>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {direction === 'string-to-json' ? 'Parsed & Formatted JSON successfully' : `Escaped into ${targetLang.toUpperCase()} string format`}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="string-json"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel={direction === 'string-to-json' ? 'String / Escaped JSON Input' : 'JSON Object Input'}
      outputLabel={direction === 'string-to-json' ? 'Parsed JSON Output' : 'String Literal Output'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default StringJsonConverter;
