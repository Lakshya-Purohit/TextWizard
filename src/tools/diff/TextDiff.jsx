import React, { useState, useMemo, useRef, useCallback } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import * as Diff from 'diff';
import {
  MinusCircle, PlusCircle, Copy, ArrowLeftRight, Trash2,
  FileText, CheckCircle, Code, Edit3, Eye
} from 'lucide-react';
import './TextDiff.css';

const SAMPLES = {
  json: {
    original: `{\n  "name": "DevWizard",\n  "version": "3.1.0",\n  "features": [\n    "json-formatter",\n    "base64-tool"\n  ],\n  "localOnly": true,\n  "status": "deprecated"\n}`,
    modified: `{\n  "name": "DevWizard Pro",\n  "version": "4.2.0",\n  "features": [\n    "json-formatter",\n    "json-tree-viewer",\n    "side-by-side-diff",\n    "base64-tool"\n  ],\n  "localOnly": true,\n  "status": "active"\n}`
  },
  code: {
    original: `function calculateTotal(items, discount) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  if (discount > 0) {\n    total = total - (total * discount);\n  }\n  return total;\n}`,
    modified: `function calculateTotal(items = [], discount = 0, taxRate = 0.08) {\n  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);\n  const discounted = discount > 0 ? subtotal * (1 - discount) : subtotal;\n  const total = discounted * (1 + taxRate);\n  return Number(total.toFixed(2));\n}`
  }
};

const TextDiff = () => {
  const { showToast } = useApp();
  const [originalText, setOriginalText] = useState(SAMPLES.json.original);
  const [modifiedText, setModifiedText] = useState(SAMPLES.json.modified);
  const [mode, setMode] = useState('diff'); // 'diff' | 'edit'
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [granularity, setGranularity] = useState('words'); // 'words' | 'chars'

  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const isSyncingScroll = useRef(false);

  // Synchronized scrolling
  const handleScroll = useCallback((source) => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const sourceEl = source === 'left' ? leftScrollRef.current : rightScrollRef.current;
    const targetEl = source === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (sourceEl && targetEl) {
      targetEl.scrollTop = sourceEl.scrollTop;
      targetEl.scrollLeft = sourceEl.scrollLeft;
    }

    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }, []);

  // Compute aligned side-by-side diff with word/char level changes
  const { alignedRows, stats } = useMemo(() => {
    const orig = ignoreWhitespace ? originalText.replace(/[ \t]+$/gm, '') : originalText;
    const mod = ignoreWhitespace ? modifiedText.replace(/[ \t]+$/gm, '') : modifiedText;

    const diffChunks = Diff.diffLines(orig, mod, { ignoreWhitespace });
    const rows = [];

    let leftLineNum = 1;
    let rightLineNum = 1;
    let totalAdditions = 0;
    let totalRemovals = 0;

    for (let i = 0; i < diffChunks.length; i++) {
      const chunk = diffChunks[i];
      const nextChunk = diffChunks[i + 1];

      // Modified replacement block (removed followed by added)
      if (chunk.removed && nextChunk && nextChunk.added) {
        const removedLines = chunk.value.replace(/\n$/, '').split('\n');
        const addedLines = nextChunk.value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(removedLines.length, addedLines.length);

        for (let j = 0; j < maxLen; j++) {
          const lText = removedLines[j];
          const rText = addedLines[j];

          let leftTokens = null;
          let rightTokens = null;

          if (lText !== undefined && rText !== undefined) {
            // Compute word / char level diff between these two lines
            const lineDiff = granularity === 'chars'
              ? Diff.diffChars(lText, rText)
              : Diff.diffWordsWithSpace(lText, rText);

            leftTokens = lineDiff
              .filter(p => !p.added)
              .map(p => ({ text: p.value, changed: !!p.removed }));

            rightTokens = lineDiff
              .filter(p => !p.removed)
              .map(p => ({ text: p.value, changed: !!p.added }));
          }

          if (lText !== undefined) totalRemovals++;
          if (rText !== undefined) totalAdditions++;

          rows.push({
            type: 'modified',
            left: lText !== undefined ? {
              lineNum: leftLineNum++,
              text: lText,
              tokens: leftTokens,
              type: 'removed'
            } : null,
            right: rText !== undefined ? {
              lineNum: rightLineNum++,
              text: rText,
              tokens: rightTokens,
              type: 'added'
            } : null
          });
        }

        i++; // skip nextChunk since we processed it
      } else if (chunk.removed) {
        // Pure removal
        const lines = chunk.value.replace(/\n$/, '').split('\n');
        for (const lineText of lines) {
          totalRemovals++;
          rows.push({
            type: 'removed',
            left: {
              lineNum: leftLineNum++,
              text: lineText,
              tokens: [{ text: lineText, changed: true }],
              type: 'removed'
            },
            right: null
          });
        }
      } else if (chunk.added) {
        // Pure addition
        const lines = chunk.value.replace(/\n$/, '').split('\n');
        for (const lineText of lines) {
          totalAdditions++;
          rows.push({
            type: 'added',
            left: null,
            right: {
              lineNum: rightLineNum++,
              text: lineText,
              tokens: [{ text: lineText, changed: true }],
              type: 'added'
            }
          });
        }
      } else {
        // Unchanged
        const lines = chunk.value.replace(/\n$/, '').split('\n');
        for (const lineText of lines) {
          rows.push({
            type: 'unchanged',
            left: {
              lineNum: leftLineNum++,
              text: lineText,
              tokens: [{ text: lineText, changed: false }],
              type: 'unchanged'
            },
            right: {
              lineNum: rightLineNum++,
              text: lineText,
              tokens: [{ text: lineText, changed: false }],
              type: 'unchanged'
            }
          });
        }
      }
    }

    const leftTotalLines = originalText ? originalText.split('\n').length : 0;
    const rightTotalLines = modifiedText ? modifiedText.split('\n').length : 0;

    return {
      alignedRows: rows,
      stats: {
        removals: totalRemovals,
        additions: totalAdditions,
        leftLines: leftTotalLines,
        rightLines: rightTotalLines,
        totalRows: rows.length
      }
    };
  }, [originalText, modifiedText, ignoreWhitespace, granularity]);

  const handleCopy = useCallback((text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, 'success');
  }, [showToast]);

  const handleSwap = useCallback(() => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
    showToast('Swapped left and right texts', 'info');
  }, [originalText, modifiedText, showToast]);

  const handleClearAll = useCallback(() => {
    setOriginalText('');
    setModifiedText('');
    showToast('Cleared diff workspaces', 'info');
  }, [showToast]);

  const handleLoadSample = useCallback((key) => {
    if (SAMPLES[key]) {
      setOriginalText(SAMPLES[key].original);
      setModifiedText(SAMPLES[key].modified);
      showToast(`Loaded ${key.toUpperCase()} sample`, 'success');
    }
  }, [showToast]);

  const toolbar = (
    <div className="diff-main-toolbar">
      <div className="dw-btn-group">
        <button
          className={`dw-btn dw-btn-sm ${mode === 'diff' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('diff')}
          title="Side-by-side comparison view"
        >
          <Eye size={12} />
          <span>Diff View</span>
        </button>
        <button
          className={`dw-btn dw-btn-sm ${mode === 'edit' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
          onClick={() => setMode('edit')}
          title="Live raw text editor view"
        >
          <Edit3 size={12} />
          <span>Edit Inputs</span>
        </button>
      </div>

      <div className="diff-toolbar-divider" />

      <div className="diff-toolbar-options">
        <label className="diff-checkbox-label">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
          />
          <span>Ignore Whitespace</span>
        </label>

        <select
          className="diff-select"
          value={granularity}
          onChange={(e) => setGranularity(e.target.value)}
          title="Change token comparison granularity"
        >
          <option value="words">Word Level Diff</option>
          <option value="chars">Character Level Diff</option>
        </select>
      </div>

      <div className="diff-toolbar-divider" />

      <div className="dw-btn-group">
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={() => handleLoadSample('json')}
          title="Load sample JSON difference"
        >
          <FileText size={12} />
          <span>JSON Sample</span>
        </button>
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={() => handleLoadSample('code')}
          title="Load sample Code difference"
        >
          <Code size={12} />
          <span>Code Sample</span>
        </button>
        <button
          className="dw-btn dw-btn-ghost dw-btn-sm"
          onClick={handleClearAll}
          title="Clear both sides"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );

  const statusLeft = (
    <div className="diff-status-bar">
      <span className="diff-status-item removal">
        <MinusCircle size={12} /> {stats.removals} {stats.removals === 1 ? 'removal' : 'removals'}
      </span>
      <span className="diff-status-item addition">
        <PlusCircle size={12} /> {stats.additions} {stats.additions === 1 ? 'addition' : 'additions'}
      </span>
      {stats.removals === 0 && stats.additions === 0 && originalText && (
        <span className="diff-status-item match">
          <CheckCircle size={12} /> Files are identical
        </span>
      )}
    </div>
  );

  const statusRight = (
    <div className="diff-stats-right">
      <span>Original: <strong>{stats.leftLines}</strong> lines ({originalText.length} chars)</span>
      <span>•</span>
      <span>Modified: <strong>{stats.rightLines}</strong> lines ({modifiedText.length} chars)</span>
    </div>
  );

  return (
    <ToolWorkspace
      toolId="text-diff"
      singlePanel={true}
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
    >
      <div className="diff-screens-container">
        {/* Top Header Bar matching user's image */}
        <div className="diff-side-headers-row">
          {/* Left Panel Header */}
          <div className="diff-side-header left-header">
            <div className="diff-header-badge removal-badge">
              <MinusCircle size={14} className="diff-badge-icon" />
              <span className="diff-badge-text">
                {stats.removals} {stats.removals === 1 ? 'removal' : 'removals'}
              </span>
            </div>
            <div className="diff-header-meta">
              <span className="diff-header-linecount">{stats.leftLines} {stats.leftLines === 1 ? 'line' : 'lines'}</span>
              <button
                className="diff-header-copy-btn"
                onClick={() => handleCopy(originalText, 'Original')}
                title="Copy original text"
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Center Swap Action */}
          <div className="diff-header-center-swap">
            <button
              className="diff-swap-btn"
              onClick={handleSwap}
              title="Swap original and modified text"
            >
              <ArrowLeftRight size={13} />
            </button>
          </div>

          {/* Right Panel Header */}
          <div className="diff-side-header right-header">
            <div className="diff-header-badge addition-badge">
              <PlusCircle size={14} className="diff-badge-icon" />
              <span className="diff-badge-text">
                {stats.additions} {stats.additions === 1 ? 'addition' : 'additions'}
              </span>
            </div>
            <div className="diff-header-meta">
              <span className="diff-header-linecount">{stats.rightLines} {stats.rightLines === 1 ? 'line' : 'lines'}</span>
              <button
                className="diff-header-copy-btn"
                onClick={() => handleCopy(modifiedText, 'Modified')}
                title="Copy modified text"
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Side-by-Side Screens */}
        {mode === 'edit' ? (
          <div className="diff-edit-screens-row">
            <div className="diff-edit-pane left-edit-pane">
              <textarea
                className="diff-edit-textarea"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original (before) text here..."
                spellCheck={false}
              />
            </div>
            <div className="diff-edit-pane right-edit-pane">
              <textarea
                className="diff-edit-textarea"
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                placeholder="Paste modified (after) text here..."
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <div className="diff-screens-viewport">
            {/* Left Screen (Removals / Before) */}
            <div
              className="diff-side-screen left-screen"
              ref={leftScrollRef}
              onScroll={() => handleScroll('left')}
            >
              <div className="diff-lines-table">
                {alignedRows.map((row, idx) => {
                  const cell = row.left;
                  const isRemoved = cell && cell.type === 'removed';
                  const isSpacer = !cell;

                  return (
                    <div
                      key={`left-${idx}`}
                      className={`diff-line-row ${isRemoved ? 'line-removed' : isSpacer ? 'line-spacer' : 'line-unchanged'}`}
                    >
                      <div className="diff-line-gutter">
                        <span className="diff-line-num">{cell ? cell.lineNum : ''}</span>
                      </div>
                      <div className="diff-line-code">
                        {cell && cell.tokens ? (
                          cell.tokens.map((token, tIdx) => (
                            <span
                              key={tIdx}
                              className={token.changed ? 'token-diff token-removed' : 'token-normal'}
                            >
                              {token.text}
                            </span>
                          ))
                        ) : cell ? (
                          <span>{cell.text}</span>
                        ) : (
                          <span className="diff-empty-fill">&nbsp;</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Screen (Additions / After) */}
            <div
              className="diff-side-screen right-screen"
              ref={rightScrollRef}
              onScroll={() => handleScroll('right')}
            >
              <div className="diff-lines-table">
                {alignedRows.map((row, idx) => {
                  const cell = row.right;
                  const isAdded = cell && cell.type === 'added';
                  const isSpacer = !cell;

                  return (
                    <div
                      key={`right-${idx}`}
                      className={`diff-line-row ${isAdded ? 'line-added' : isSpacer ? 'line-spacer' : 'line-unchanged'}`}
                    >
                      <div className="diff-line-gutter">
                        <span className="diff-line-num">{cell ? cell.lineNum : ''}</span>
                      </div>
                      <div className="diff-line-code">
                        {cell && cell.tokens ? (
                          cell.tokens.map((token, tIdx) => (
                            <span
                              key={tIdx}
                              className={token.changed ? 'token-diff token-added' : 'token-normal'}
                            >
                              {token.text}
                            </span>
                          ))
                        ) : cell ? (
                          <span>{cell.text}</span>
                        ) : (
                          <span className="diff-empty-fill">&nbsp;</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Minimap / Overview Indicator Track */}
            <div className="diff-overview-minimap" title="Diff Overview Minimap">
              {alignedRows.map((row, idx) => {
                if (row.type === 'unchanged') return null;
                const topPct = (idx / Math.max(1, alignedRows.length)) * 100;
                return (
                  <div
                    key={`map-${idx}`}
                    className={`minimap-marker ${row.type === 'removed' ? 'marker-removed' : row.type === 'added' ? 'marker-added' : 'marker-modified'}`}
                    style={{ top: `${topPct}%` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default TextDiff;
