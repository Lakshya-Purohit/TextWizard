import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { CheckCircle, AlertCircle, Settings2 } from 'lucide-react';

const JsonConverter = () => {
  const [input, setInput] = useState('{\n  "id": 101,\n  "name": "DevWizard",\n  "active": true,\n  "user": {\n    "firstName": "Lakshya",\n    "contact": {\n      "email": "dev@example.com",\n      "city": "Bengaluru"\n    }\n  },\n  "tags": ["developer", "tools", "utility"]\n}');
  const [targetFormat, setTargetFormat] = useState('csv'); // yaml | xml | csv | string | from-string
  const [csvDelimiter, setCsvDelimiter] = useState('.');
  const [stringTarget, setStringTarget] = useState('escaped'); // escaped | js | java | python | csharp

  const isReverseStringToJson = targetFormat === 'from-string';

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      let output = '';
      if (targetFormat === 'from-string') {
        output = transform(input, 'string-json');
      } else if (targetFormat === 'string') {
        output = transform(input, 'json-string', { format: stringTarget });
      } else if (targetFormat === 'csv') {
        output = transform(input, 'json-csv', { delimiter: csvDelimiter });
      } else {
        output = transform(input, `json-${targetFormat}`);
      }
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, targetFormat, csvDelimiter, stringTarget]);

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
        <button
          className={`dw-tab ${targetFormat === 'csv' ? 'active' : ''}`}
          onClick={() => setTargetFormat('csv')}
          title="Convert JSON to CSV with nested object flattening"
        >
          JSON → CSV
        </button>
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
          className={`dw-tab ${targetFormat === 'string' ? 'active' : ''}`}
          onClick={() => setTargetFormat('string')}
          title="Turn JSON into escaped string literal"
        >
          JSON → String
        </button>
        <button
          className={`dw-tab ${targetFormat === 'from-string' ? 'active' : ''}`}
          onClick={() => setTargetFormat('from-string')}
          title="Parse escaped string into formatted JSON"
        >
          String → JSON
        </button>
      </div>

      {targetFormat === 'csv' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <Settings2 size={13} />
          <span>Flatten Delimiter:</span>
          <select
            className="dw-select"
            value={csvDelimiter}
            onChange={(e) => setCsvDelimiter(e.target.value)}
            style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
          >
            <option value=".">Dot (.) e.g. user.contact.email</option>
            <option value="_">Underscore (_) e.g. user_contact_email</option>
            <option value="/">Slash (/) e.g. user/contact/email</option>
          </select>
        </div>
      )}

      {targetFormat === 'string' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <span>Format:</span>
          <select
            className="dw-select"
            value={stringTarget}
            onChange={(e) => setStringTarget(e.target.value)}
            style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
          >
            <option value="escaped">Escaped JSON String Literal</option>
            <option value="js">JavaScript / TypeScript (const json = "...")</option>
            <option value="java">Java String (String json = "...")</option>
            <option value="python">Python Triple-Quote String</option>
            <option value="csharp">C# Verbatim String (@"...")</option>
          </select>
        </div>
      )}
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {
        targetFormat === 'from-string' ? 'Parsed String to Formatted JSON' :
        targetFormat === 'string' ? `Escaped to ${stringTarget.toUpperCase()} String` :
        `Converted to ${targetFormat.toUpperCase()}${targetFormat === 'csv' ? ' (Nested objects flattened)' : ''}`
      }
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
      output={result.output}
      errorMessage={result.valid === false ? result.error : null}
      onInputChange={setInput}
      inputLabel={isReverseStringToJson ? 'Escaped String Input' : 'JSON Input'}
      outputLabel={isReverseStringToJson ? 'Formatted JSON Output' : `${targetFormat.toUpperCase()} Output`}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default JsonConverter;
