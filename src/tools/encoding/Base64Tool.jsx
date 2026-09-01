import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolWorkspace from '../ToolWorkspace';
import { transform } from '../../engine/transformEngine';
import { Upload, CheckCircle, AlertCircle, FileImage } from 'lucide-react';

const Base64Tool = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('Hello DevWizard V4!');
  const [mode, setMode] = useState('text-base64'); // text-base64 | base64-text | text-hex | hex-text | text-binary | binary-text
  const fileInputRef = useRef(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', valid: null, error: null };
    try {
      const output = transform(input, mode);
      return { output, valid: true, error: null };
    } catch (e) {
      return { output: '', valid: false, error: e.message };
    }
  }, [input, mode]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1] || '';
      setInput(base64);
      setMode('base64-text');
    };
    reader.readAsDataURL(file);
  };

  const toolbar = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <select
        className="dw-input dw-select"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '13px' }}
      >
        <optgroup label="Base64">
          <option value="text-base64">Text → Base64</option>
          <option value="base64-text">Base64 → Text</option>
        </optgroup>
        <optgroup label="Hexadecimal">
          <option value="text-hex">Text → Hex</option>
          <option value="hex-text">Hex → Text</option>
        </optgroup>
        <optgroup label="Binary">
          <option value="text-binary">Text → Binary</option>
          <option value="binary-text">Binary → Text</option>
        </optgroup>
      </select>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={12} />
        File to Base64
      </button>

      <button
        className="dw-btn dw-btn-secondary dw-btn-sm"
        onClick={() => navigate('/tool/base64-file')}
        title="Open Base64 to PDF / Image / Video Converter"
      >
        <FileImage size={12} />
        Base64 to PDF / Media
      </button>
    </div>
  );

  const statusLeft = result.valid === true ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Encoded / Decoded Successfully
    </span>
  ) : result.valid === false ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {result.error}
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="base64"
      input={input}
      output={result.output || result.error || ''}
      onInputChange={setInput}
      inputLabel="Input Data"
      outputLabel="Converted Output"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
    />
  );
};

export default Base64Tool;
