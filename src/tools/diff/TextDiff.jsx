import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import * as Diff from 'diff';
import { Columns, List, Plus, Minus } from 'lucide-react';
import './TextDiff.css';

const TextDiff = () => {
  const [originalText, setOriginalText] = useState('{\n  "name": "DevWizard",\n  "version": 3,\n  "tools": [\n    "json",\n    "xml"\n  ]\n}');
  const [modifiedText, setModifiedText] = useState('{\n  "name": "DevWizard V4",\n  "version": 4,\n  "tools": [\n    "json",\n    "xml",\n    "jwt",\n    "diff"\n  ],\n  "localOnly": true\n}');
  const [viewMode, setViewMode] = useState('split'); // split | unified
  const [diffGranularity, setDiffGranularity] = useState('lines'); // lines | words | chars

  const diffResult = useMemo(() => {
    let diff;
    if (diffGranularity === 'lines') {
      diff = Diff.diffLines(originalText, modifiedText);
    } else if (diffGranularity === 'words') {
      diff = Diff.diffWords(originalText, modifiedText);
    } else {
      diff = Diff.diffChars(originalText, modifiedText);
    }

    let addedCount = 0;
    let removedCount = 0;

    diff.forEach(part => {
      if (part.added) addedCount += part.count || 1;
      if (part.removed) removedCount += part.count || 1;
    });

    return { diff, addedCount, removedCount };
  }, [originalText, modifiedText, diffGranularity]);

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${viewMode === 'split' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setViewMode('split')}
        >
          <Columns size={12} />
          Split / Side-by-Side
        </button>
        <button
          className={`dw-btn dw-btn-sm ${viewMode === 'unified' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setViewMode('unified')}
        >
          <List size={12} />
          Unified
        </button>
      </div>

      <select
        className="dw-input dw-select"
        value={diffGranularity}
        onChange={(e) => setDiffGranularity(e.target.value)}
        style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '13px' }}
      >
        <option value="lines">Diff by Lines</option>
        <option value="words">Diff by Words</option>
        <option value="chars">Diff by Characters</option>
      </select>
    </div>
  );

  const statusLeft = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Plus size={12} /> {diffResult.addedCount} additions
      </span>
      <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Minus size={12} /> {diffResult.removedCount} deletions
      </span>
    </div>
  );

  return (
    <ToolWorkspace
      toolId="text-diff"
      singlePanel={true}
      toolbar={toolbar}
      statusLeft={statusLeft}
    >
      <div className="diff-container">
        {/* Editors inputs for side-by-side */}
        <div className="diff-inputs-row">
          <div className="diff-input-pane">
            <div className="diff-pane-title">Original (Before)</div>
            <textarea
              className="dw-workspace-textarea"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Original text..."
              spellCheck={false}
            />
          </div>
          <div className="diff-input-pane">
            <div className="diff-pane-title">Modified (After)</div>
            <textarea
              className="dw-workspace-textarea"
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder="Modified text..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Diff Output */}
        <div className="diff-output-panel">
          <div className="diff-pane-title">Comparison Results</div>
          <div className={`diff-view ${viewMode}`}>
            {diffResult.diff.map((part, idx) => {
              const className = part.added
                ? 'diff-chunk-added'
                : part.removed
                ? 'diff-chunk-removed'
                : 'diff-chunk-unchanged';
              return (
                <span key={idx} className={className}>
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default TextDiff;
