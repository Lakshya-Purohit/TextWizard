import React, { useState, useCallback, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { Braces, Minimize2, CheckCircle, AlertCircle } from 'lucide-react';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState('format'); // format | minify

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      const parsed = JSON.parse(input);
      const output = mode === 'minify'
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, indentSize);
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, indentSize, mode]);

  const toolbar = (
    <>
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${mode === 'format' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('format')}
        >
          <Braces size={12} />
          Format
        </button>
        <button
          className={`dw-btn dw-btn-sm ${mode === 'minify' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('minify')}
        >
          <Minimize2 size={12} />
          Minify
        </button>
      </div>
      {mode === 'format' && (
        <select
          className="dw-input dw-select"
          style={{ width: 'auto', padding: '4px 28px 4px 8px' }}
          value={indentSize}
          onChange={(e) => setIndentSize(Number(e.target.value))}
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
      )}
    </>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Valid JSON
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  const statusRight = input ? (
    <span>{input.length} chars</span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="json-formatter"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="JSON Input"
      outputLabel={mode === 'format' ? 'Formatted' : 'Minified'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
    />
  );
};

export default JsonFormatter;
