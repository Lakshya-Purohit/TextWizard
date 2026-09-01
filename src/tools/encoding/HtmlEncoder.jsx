import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle } from 'lucide-react';

const HtmlEncoder = () => {
  const [input, setInput] = useState('<div class="header">Hello & Welcome "DevWizard"!</div>');
  const [mode, setMode] = useState('html-encode');

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
        className={`dw-tab ${mode === 'html-encode' ? 'active' : ''}`}
        onClick={() => setMode('html-encode')}
      >
        HTML Escape / Encode
      </button>
      <button
        className={`dw-tab ${mode === 'html-decode' ? 'active' : ''}`}
        onClick={() => setMode('html-decode')}
      >
        HTML Unescape / Decode
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {mode === 'html-encode' ? 'HTML Encoded' : 'HTML Decoded'}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="html-encoder"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="Input HTML or Text"
      outputLabel="Result"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default HtmlEncoder;
