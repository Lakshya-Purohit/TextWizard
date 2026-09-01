import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle } from 'lucide-react';

const JsonConverter = () => {
  const [input, setInput] = useState('{\n  "id": 101,\n  "name": "DevWizard",\n  "active": true,\n  "tags": ["developer", "tools", "utility"]\n}');
  const [targetFormat, setTargetFormat] = useState('yaml'); // yaml | xml | csv

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      const output = transform(input, `json-${targetFormat}`);
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, targetFormat]);

  const toolbar = (
    <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
      <button
        className={`dw-tab ${targetFormat === 'yaml' ? 'active' : ''}`}
        onClick={() => setTargetFormat('yaml')}
      >
        JSON → YAML
      </button>
      <button
        className={`dw-tab ${targetFormat === 'xml' ? 'active' : ''}`}
        onClick={() => setTargetFormat('xml')}
      >
        JSON → XML
      </button>
      <button
        className={`dw-tab ${targetFormat === 'csv' ? 'active' : ''}`}
        onClick={() => setTargetFormat('csv')}
      >
        JSON → CSV
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Converted to {targetFormat.toUpperCase()}
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="json-converter"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="JSON Input"
      outputLabel={`${targetFormat.toUpperCase()} Output`}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default JsonConverter;
