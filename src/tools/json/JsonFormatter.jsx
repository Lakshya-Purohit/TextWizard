import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { Braces, Minimize2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const SAMPLES = {
  basic: `{\n  "service": "DevWizard API",\n  "version": "4.2.0",\n  "active": true,\n  "endpoints": [\n    {\n      "path": "/api/v1/format",\n      "method": "POST",\n      "rateLimit": 1000\n    },\n    {\n      "path": "/api/v1/validate",\n      "method": "POST",\n      "rateLimit": 2500\n    }\n  ],\n  "settings": {\n    "caching": true,\n    "telemetry": false,\n    "timeoutSeconds": 30\n  }\n}`,
  minified: `{"name":"DevWizard","version":4,"features":["json","xml","diff","jwt","crypto"],"secure":true}`,
  nested: `{"company":{"name":"TechCorp","departments":[{"id":1,"name":"Engineering","members":[{"name":"Alex","role":"Lead"}]}]}}`
};

const JsonFormatter = () => {
  const [input, setInput] = useState(SAMPLES.basic);
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState('format'); // 'format' | 'minify'

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null, lineCol: null };
    try {
      const parsed = JSON.parse(input);
      const output = mode === 'minify'
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indentSize);
      return { output, valid: true, error: null, lineCol: null };
    } catch (e) {
      // Extract line & col from standard V8 syntax errors
      const match = e.message.match(/at position (\d+)/i);
      let lineCol = null;
      if (match) {
        const pos = parseInt(match[1], 10);
        const upToError = input.substring(0, pos);
        const lines = upToError.split('\n');
        lineCol = { line: lines.length, col: lines[lines.length - 1].length + 1 };
      }
      return { output: '', valid: false, error: e.message, lineCol };
    }
  }, [input, indentSize, mode]);

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${mode === 'format' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('format')}
        >
          <Braces size={12} />
          <span>Format</span>
        </button>
        <button
          className={`dw-btn dw-btn-sm ${mode === 'minify' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('minify')}
        >
          <Minimize2 size={12} />
          <span>Minify</span>
        </button>
      </div>

      {mode === 'format' && (
        <select
          className="dw-input dw-select"
          style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '12px', height: '28px' }}
          value={indentSize}
          onChange={(e) => setIndentSize(Number(e.target.value))}
        >
          <option value={2}>2 Spaces</option>
          <option value={4}>4 Spaces</option>
          <option value={8}>8 Spaces</option>
        </select>
      )}

      <div className="dw-btn-group">
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={() => setInput(SAMPLES.basic)}
          title="Load sample API config JSON"
        >
          <Sparkles size={11} />
          <span>Sample</span>
        </button>
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={() => setInput(SAMPLES.minified)}
          title="Load minified JSON"
        >
          <span>Minified</span>
        </button>
      </div>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Valid JSON structure
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.lineCol ? `Syntax Error on Line ${result.lineCol.line}, Col ${result.lineCol.col}` : result.error}
    </span>
  ) : (
    <span>JSON Formatter & Minifier</span>
  );

  const statusRight = input ? (
    <span>Input: <strong>{input.length}</strong> chars • Output: <strong>{result.output ? result.output.length : 0}</strong> chars</span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="json-formatter"
      input={input}
      output={result.output}
      errorMessage={result.valid === false ? result.error : null}
      onInputChange={setInput}
      inputLabel="JSON Input"
      outputLabel={mode === 'format' ? `Formatted JSON (${indentSize} spaces)` : 'Minified JSON'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
    />
  );
};

export default JsonFormatter;
