import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle, ArrowLeftRight, Sparkles } from 'lucide-react';

const SAMPLES = {
  encode: '<div class="header" id="banner">\n  <h1>DevWizard &amp; "Security" Suite</h1>\n  <p>Protecting user data with client-side &lt;sandboxes&gt;.</p>\n</div>',
  decode: '&lt;div class=&quot;header&quot; id=&quot;banner&quot;&gt;\n  &lt;h1&gt;DevWizard &amp;amp; &quot;Security&quot; Suite&lt;/h1&gt;\n  &lt;p&gt;Protecting user data with client-side &amp;lt;sandboxes&amp;gt;.&lt;/p&gt;\n&lt;/div&gt;'
};

const HtmlEncoder = () => {
  const [input, setInput] = useState(SAMPLES.encode);
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

  const handleSwap = () => {
    if (mode === 'html-encode') {
      setMode('html-decode');
      if (result.output) setInput(result.output);
    } else {
      setMode('html-encode');
      if (result.output) setInput(result.output);
    }
  };

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
        <button
          className={`dw-tab ${mode === 'html-encode' ? 'active' : ''}`}
          onClick={() => setMode('html-encode')}
        >
          HTML Escape
        </button>
        <button
          className={`dw-tab ${mode === 'html-decode' ? 'active' : ''}`}
          onClick={() => setMode('html-decode')}
        >
          HTML Unescape
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
        onClick={() => setInput(mode === 'html-encode' ? SAMPLES.encode : SAMPLES.decode)}
        title="Load sample HTML"
      >
        <Sparkles size={11} />
        <span>Sample</span>
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {mode === 'html-encode' ? 'HTML Entities Escaped' : 'HTML Entities Unescaped'}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : (
    <span>HTML Entity Encoder & Escaper</span>
  );

  return (
    <ToolWorkspace
      toolId="html-encoder"
      input={input}
      output={result.output}
      errorMessage={result.valid === false ? result.error : null}
      onInputChange={setInput}
      inputLabel={mode === 'html-encode' ? 'Raw HTML / Text Input' : 'HTML Entity Escaped String'}
      outputLabel={mode === 'html-encode' ? 'Escaped HTML Entities' : 'Unescaped Raw HTML Output'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default HtmlEncoder;
