import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { Type, Sparkles } from 'lucide-react';

const TextTransform = () => {
  const [input, setInput] = useState('Welcome to DevWizard V4!\nThe unified workspace for modern developers.');

  // Transformations
  const transforms = {
    upper: (str) => str.toUpperCase(),
    lower: (str) => str.toLowerCase(),
    title: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    sentence: (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    camel: (str) => str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return "";
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    }).replace(/\s+/g, ''),
    snake: (str) => str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || str,
    kebab: (str) => str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || str,
    reverse: (str) => str.split('').reverse().join(''),
    reverseLines: (str) => str.split('\n').reverse().join('\n'),
    sortLinesAsc: (str) => str.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'),
    sortLinesDesc: (str) => str.split('\n').sort((a, b) => b.localeCompare(a)).join('\n'),
    uniqueLines: (str) => Array.from(new Set(str.split('\n'))).join('\n'),
    trimLines: (str) => str.split('\n').map(l => l.trim()).join('\n'),
    removeEmptyLines: (str) => str.split('\n').filter(l => l.trim().length > 0).join('\n')
  };

  const [activeTransform, setActiveTransform] = useState('upper');

  const output = useMemo(() => {
    if (!input) return '';
    try {
      return transforms[activeTransform] ? transforms[activeTransform](input) : input;
    } catch {
      return input;
    }
  }, [input, activeTransform]);

  // Statistics
  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split('\n').length : 0;
    const readingTimeMinutes = (words / 200).toFixed(2);
    return { chars, words, lines, readingTimeMinutes };
  }, [input]);

  const toolbar = (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      <select
        className="dw-input dw-select"
        value={activeTransform}
        onChange={(e) => setActiveTransform(e.target.value)}
        style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '13px' }}
      >
        <optgroup label="Letter Case">
          <option value="upper">UPPERCASE</option>
          <option value="lower">lowercase</option>
          <option value="title">Title Case</option>
          <option value="sentence">Sentence case</option>
          <option value="camel">camelCase</option>
          <option value="snake">snake_case</option>
          <option value="kebab">kebab-case</option>
        </optgroup>
        <optgroup label="Line Operations">
          <option value="trimLines">Trim Leading/Trailing Space</option>
          <option value="removeEmptyLines">Remove Empty Lines</option>
          <option value="uniqueLines">Deduplicate Lines</option>
          <option value="sortLinesAsc">Sort Lines (A-Z)</option>
          <option value="sortLinesDesc">Sort Lines (Z-A)</option>
          <option value="reverseLines">Reverse Lines</option>
        </optgroup>
        <optgroup label="Special">
          <option value="reverse">Reverse Entire String</option>
        </optgroup>
      </select>
    </div>
  );

  const statusLeft = (
    <span>
      <strong>{stats.words}</strong> words &bull; <strong>{stats.chars}</strong> chars &bull; <strong>{stats.lines}</strong> lines
    </span>
  );

  const statusRight = (
    <span>Estimated read: ~{stats.readingTimeMinutes} min</span>
  );

  return (
    <ToolWorkspace
      toolId="text-transform"
      input={input}
      output={output}
      onInputChange={setInput}
      inputLabel="Original Text"
      outputLabel="Transformed Result"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
    />
  );
};

export default TextTransform;
