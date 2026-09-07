import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle, AlertCircle, Sparkles, ArrowRight, ArrowLeftRight,
  Copy, Check, Trash2, FileText, Code2, Braces, Quote
} from 'lucide-react';
import './StringJsonConverter.css';

const SAMPLES = {
  stringToJson: `"{\\"event\\": \\"user_signup\\", \\"userId\\": 9841, \\"meta\\": {\\"source\\": \\"adwords\\", \\"timestamp\\": 1773010942}, \\"tags\\": [\\"pro\\", \\"annual\\"]}"`,
  jsonToString: `{\n  "service": "auth-gateway",\n  "port": 8080,\n  "enabled": true,\n  "endpoints": [\n    "/api/v1/login",\n    "/api/v1/verify"\n  ],\n  "rateLimit": {\n    "maxRequests": 100,\n    "windowMs": 60000\n  }\n}`,
  multilineString: `user=admin\nrole=developer\nstatus=active\ntimezone=Asia/Kolkata`,
  logString: `2026-09-08 02:22:22 [INFO] HTTP POST /api/v1/checkout payload="{\\"orderId\\":\\"ORD-9912\\",\\"amount\\":249.99,\\"currency\\":\\"INR\\",\\"customer\\":{\\"name\\":\\"Lakshya\\",\\"verified\\":true}}"`
};

const StringJsonConverter = () => {
  const { showToast } = useApp();
  const [direction, setDirection] = useState('string-to-json'); // 'string-to-json' | 'json-to-string'
  const [input, setInput] = useState(SAMPLES.stringToJson);
  const [copied, setCopied] = useState(false);

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

  const handleSwapValues = () => {
    if (result.output && result.valid) {
      const nextDir = direction === 'string-to-json' ? 'json-to-string' : 'string-to-json';
      setDirection(nextDir);
      setInput(result.output);
      showToast(`Swapped direction to ${nextDir === 'string-to-json' ? 'String → JSON' : 'JSON → String'}`, 'info');
    } else {
      handleToggleDirection(direction === 'string-to-json' ? 'json-to-string' : 'string-to-json');
    }
  };

  const handleLoadSample = (sampleKey) => {
    if (sampleKey === 'multiline') {
      setDirection('string-to-json');
      setInput(SAMPLES.multilineString);
    } else if (sampleKey === 'log') {
      setDirection('string-to-json');
      setInput(SAMPLES.logString);
    } else if (sampleKey === 'stringToJson') {
      setDirection('string-to-json');
      setInput(SAMPLES.stringToJson);
    } else {
      setDirection('json-to-string');
      setInput(SAMPLES.jsonToString);
    }
    showToast('Loaded sample into input', 'info');
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

        // Check if input has log line wrapping JSON: e.g. payload="{...}"
        let candidate = trimmed;
        const logMatch = trimmed.match(/(?:payload|json|data|body)\s*=\s*"({.+})"/i) || trimmed.match(/("{\\?".+}")/);
        if (logMatch && logMatch[1]) {
          candidate = logMatch[1];
        }

        let parsed;
        let attemptUnescape = false;

        try {
          parsed = JSON.parse(candidate);
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              // regular string
            }
          }
        } catch {
          attemptUnescape = true;
        }

        if (attemptUnescape || parseMode === 'unescape-only') {
          const clean = candidate
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
        // Fallback: check if lines can be key-value or array
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

  const copyResult = () => {
    if (!result.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    showToast('Copied output to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolWorkspace
      toolId="string-json"
      singlePanel={true}
      statusLeft={
        result.valid === true ? (
          <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> {direction === 'string-to-json' ? 'Parsed & Formatted JSON successfully' : `Escaped into ${targetLang.toUpperCase()} format`}
          </span>
        ) : result.valid === false ? (
          <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> {result.error}
          </span>
        ) : (
          <span>String ⇄ JSON Converter</span>
        )
      }
    >
      <div className="sjc-container">
        {/* ============================================================ */}
        {/* 1. Master Direction Selector Cards (Zero Confusion) */}
        {/* ============================================================ */}
        <div className="sjc-hero-header">
          <div className="sjc-mode-cards">
            {/* Card 1: String -> JSON */}
            <div
              className={`sjc-mode-card ${direction === 'string-to-json' ? 'active' : ''}`}
              onClick={() => handleToggleDirection('string-to-json')}
            >
              <div className="sjc-card-title-row">
                <span className="sjc-card-title">
                  <Quote size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Mode 1: String → JSON</span>
                </span>
                <span className="sjc-card-badge">Unescape & Prettify</span>
              </div>
              <p className="sjc-card-desc">
                Paste escaped log payloads, stringified JSON literals (with escaped quotes), or plain text lines to parse into pretty, validated JSON.
              </p>
              <div className="sjc-card-preview">
                {'"{\\"user\\":\\"Alice\\"}"'} ➔ {'{ "user": "Alice" }'}
              </div>
            </div>

            {/* Card 2: JSON -> String */}
            <div
              className={`sjc-mode-card ${direction === 'json-to-string' ? 'active' : ''}`}
              onClick={() => handleToggleDirection('json-to-string')}
            >
              <div className="sjc-card-title-row">
                <span className="sjc-card-title">
                  <Braces size={15} style={{ color: 'var(--cat-json)' }} />
                  <span>Mode 2: JSON → String</span>
                </span>
                <span className="sjc-card-badge">Escape for Code</span>
              </div>
              <p className="sjc-card-desc">
                Paste raw JSON objects to escape quotes and newlines for embedding into Java, JavaScript, Python, C#, or SQL.
              </p>
              <div className="sjc-card-preview">
                {'{ "user": "Alice" }'} ➔ {'"{\\"user\\":\\"Alice\\"}"'}
              </div>
            </div>
          </div>

          {/* Flow Indicator & Swap */}
          <div className="sjc-flow-banner">
            <div className="sjc-flow-steps">
              <span className="sjc-flow-step">
                {direction === 'string-to-json' ? '🔤 Escaped String / Log' : '🗂️ Raw JSON Object'}
              </span>
              <ArrowRight size={13} className="sjc-flow-arrow" />
              <span className="sjc-flow-step">
                {direction === 'string-to-json' ? '⚙️ Auto-Unescape' : `⚙️ Escape for ${targetLang.toUpperCase()}`}
              </span>
              <ArrowRight size={13} className="sjc-flow-arrow" />
              <span className="sjc-flow-step">
                {direction === 'string-to-json' ? '🗂️ Valid Formatted JSON' : '🔤 Escaped String Literal'}
              </span>
            </div>

            <button
              className="dw-btn dw-btn-secondary dw-btn-sm"
              onClick={handleSwapValues}
              title="Swap input and output direction"
            >
              <ArrowLeftRight size={12} />
              <span>Swap Direction</span>
            </button>
          </div>

          {/* Quick Real-World Presets */}
          <div className="sjc-presets-strip">
            <span className="sjc-presets-label">Quick Samples:</span>
            {direction === 'string-to-json' ? (
              <>
                <button className="sjc-preset-chip" onClick={() => handleLoadSample('stringToJson')}>
                  ⚡ Escaped JSON Literal
                </button>
                <button className="sjc-preset-chip" onClick={() => handleLoadSample('log')}>
                  ⚡ CloudWatch / Log Line
                </button>
                <button className="sjc-preset-chip" onClick={() => handleLoadSample('multiline')}>
                  ⚡ Key=Value Text to JSON
                </button>
              </>
            ) : (
              <>
                <button className="sjc-preset-chip" onClick={() => handleLoadSample('jsonToString')}>
                  ⚡ API Config Object
                </button>
                <button className="sjc-preset-chip" onClick={() => { setTargetLang('java'); handleLoadSample('jsonToString'); }}>
                  ⚡ Java String ("...")
                </button>
                <button className="sjc-preset-chip" onClick={() => { setTargetLang('python'); handleLoadSample('jsonToString'); }}>
                  ⚡ Python String ("""...""")
                </button>
                <button className="sjc-preset-chip" onClick={() => { setTargetLang('js'); handleLoadSample('jsonToString'); }}>
                  ⚡ JavaScript String
                </button>
              </>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. Controls Toolbar */}
        {/* ============================================================ */}
        <div className="sjc-toolbar-controls">
          {direction === 'string-to-json' ? (
            <>
              <div className="sjc-select-group">
                <span>Parse Heuristic:</span>
                <select
                  className="sjc-select"
                  value={parseMode}
                  onChange={(e) => setParseMode(e.target.value)}
                >
                  <option value="auto">Auto-Detect (Escaped JSON / Logs)</option>
                  <option value="unescape-only">Unescape Escaped Quotes (\")</option>
                  <option value="key-value">Key=Value Text to Object</option>
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
                <span>Target Language:</span>
                <select
                  className="sjc-select"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  <option value="escaped">Escaped String Literal ("...")</option>
                  <option value="js">JavaScript / TypeScript (const json = "...")</option>
                  <option value="java">Java String (String json = "...")</option>
                  <option value="python">Python Triple-Quote ("""...""")</option>
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
                <span>Single Line Compact</span>
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

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="dw-btn dw-btn-primary dw-btn-sm"
              onClick={copyResult}
              title="Copy converted output"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy Output</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Dual Workspace (Distinct, Self-Explanatory Input & Output) */}
        {/* ============================================================ */}
        <div className="sjc-workspace-grid">
          {/* Left Pane: INPUT */}
          <div className="sjc-pane sjc-pane-left">
            <div className="sjc-pane-header">
              <span className="sjc-pane-header-title">
                <strong>📥 Step 1: Input</strong>
                <span>
                  {direction === 'string-to-json'
                    ? '— Paste Escaped String or Logs'
                    : '— Paste Raw JSON Object or Array'}
                </span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{input.length} chars</span>
                {input && (
                  <button
                    className="dw-btn dw-btn-ghost dw-btn-sm"
                    onClick={() => setInput('')}
                    title="Clear input"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <textarea
              className="sjc-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                direction === 'string-to-json'
                  ? 'Paste escaped string (e.g. "{\\"id\\": 1, \\"name\\": \\"Alice\\"}") or log lines here...'
                  : 'Paste JSON object (e.g. {\n  "id": 1,\n  "name": "Alice"\n}) here...'
              }
              spellCheck={false}
            />
          </div>

          {/* Right Pane: OUTPUT */}
          <div className="sjc-pane">
            <div className="sjc-pane-header">
              <span className="sjc-pane-header-title">
                <strong>📤 Step 2: Output</strong>
                <span>
                  {direction === 'string-to-json'
                    ? '— Parsed & Formatted JSON'
                    : `— Escaped String for ${targetLang.toUpperCase()}`}
                </span>
              </span>
              <span>{result.output ? result.output.length : 0} chars</span>
            </div>
            <textarea
              className="sjc-textarea sjc-textarea-readonly"
              value={result.output || result.error || ''}
              readOnly
              placeholder="Result will automatically be converted and formatted here..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default StringJsonConverter;
