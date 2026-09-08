import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle, ArrowLeftRight, Sparkles } from 'lucide-react';

const SAMPLES = {
  encode: 'https://example.com/search?query=DevWizard Developer Tools & Suite&category=security & web&tags=jwt,regex#results',
  decode: 'https%3A%2F%2Fexample.com%2Fsearch%3Fquery%3DDevWizard%20Developer%20Tools%20%26%20Suite%26category%3Dsecurity%20%26%20web%26tags%3Djwt%2Cregex%23results'
};

const UrlEncoder = () => {
  const [input, setInput] = useState(SAMPLES.encode);
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

  const handleSwap = () => {
    if (mode === 'url-encode') {
      setMode('url-decode');
      if (result.output) setInput(result.output);
    } else {
      setMode('url-encode');
      if (result.output) setInput(result.output);
    }
  };

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={handleSwap}
        title="Swap encoding direction"
      >
        <ArrowLeftRight size={12} />
        <span>Swap</span>
      </button>

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={() => setInput(mode === 'url-encode' ? SAMPLES.encode : SAMPLES.decode)}
        title="Load sample URL"
      >
        <Sparkles size={11} />
        <span>Sample</span>
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {mode === 'url-encode' ? 'URL Encoded (RFC 3986)' : 'URL Decoded'}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : (
    <span>URL Percent Encoder & Decoder</span>
  );

  return (
    <ToolWorkspace
      toolId="url-encoder"
      input={input}
      output={result.output}
      errorMessage={result.valid === false ? result.error : null}
      onInputChange={setInput}
      inputLabel={mode === 'url-encode' ? 'Plain URL / Query String' : 'Percent-Encoded URL String'}
      outputLabel={mode === 'url-encode' ? 'Percent-Encoded Result' : 'Decoded URL String'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default UrlEncoder;
