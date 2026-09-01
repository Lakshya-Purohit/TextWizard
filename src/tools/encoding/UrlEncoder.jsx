import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle } from 'lucide-react';

const UrlEncoder = () => {
  const [input, setInput] = useState('https://example.com/search?q=developer tools&category=web & tech');
  const [mode, setMode] = useState('url-encode');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      const output = transform(input, mode);
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, mode]);

  const toolbar = (
    <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
      <button
        className={`dw-tab ${mode === 'url-encode' ? 'active' : ''}`}
        onClick={() => setMode('url-encode')}
      >
        URL Encode
      </button>
      <button
        className={`dw-tab ${mode === 'url-decode' ? 'active' : ''}`}
        onClick={() => setMode('url-decode')}
      >
        URL Decode
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {mode === 'url-encode' ? 'URL Encoded' : 'URL Decoded'}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="url-encoder"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="Input URL or String"
      outputLabel="Result"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default UrlEncoder;
