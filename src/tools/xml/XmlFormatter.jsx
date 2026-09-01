import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { FileCode2, Minimize2, CheckCircle, AlertCircle } from 'lucide-react';

const XmlFormatter = () => {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?><root><name>DevWizard</name><version>4</version><platform>Web</platform></root>');
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState('format');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseTagValue: true
      });
      const parsed = parser.parse(input);

      if (!parsed || Object.keys(parsed).length === 0) {
        throw new Error('Malformed or empty XML structure');
      }

      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        format: mode === 'format',
        indentBy: ' '.repeat(indentSize),
        suppressEmptyNode: false
      });

      const built = builder.build(parsed);
      const output = built.startsWith('<?xml') ? built : '<?xml version="1.0" encoding="UTF-8"?>\n' + built;
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
          <FileCode2 size={12} />
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
        </select>
      )}
    </>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Valid XML
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="xml-formatter"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="XML Input"
      outputLabel={mode === 'format' ? 'Formatted XML' : 'Minified XML'}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default XmlFormatter;
