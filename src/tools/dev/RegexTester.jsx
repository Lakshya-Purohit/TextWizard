import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { CheckCircle, AlertCircle, Layers, Sparkles } from 'lucide-react';
import './RegexTester.css';

const PRESETS = [
  {
    name: 'Email Address',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: { g: true, i: true, m: false, s: false },
    testText: 'Contact us at support@devwizard.io or sales-team@company.org for technical inquiries.'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: { g: true, i: false, m: false, s: false },
    testText: 'Gateway: 192.168.1.1, DNS: 8.8.8.8, Backup: 10.0.0.254, Invalid: 999.1.1.1'
  },
  {
    name: 'ISO Date',
    pattern: '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])',
    flags: { g: true, i: false, m: false, s: false },
    testText: 'Deployment scheduled for 2026-09-08 and next milestone on 2026-12-31.'
  }
];

const RegexTester = () => {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState(PRESETS[0].flags);
  const [testText, setTestText] = useState(PRESETS[0].testText);

  const toggleFlag = (flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const loadPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.testText);
  };

  const regexResult = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
      const regex = new RegExp(pattern, flagStr);

      const matches = [];
      const MAX_MATCHES = 2500;

      if (flags.g) {
        let match;
        let iterations = 0;

        while ((match = regex.exec(testText)) !== null) {
          iterations++;
          if (iterations > MAX_MATCHES) break;

          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });

          // Critical fix: prevent infinite loop on zero-length matches (e.g. ^, \b, a*)
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, testText]);

  // Highlight matches in test text
  const highlightedText = useMemo(() => {
    if (!regexResult.matches.length || regexResult.error) return testText;

    const elements = [];
    let lastIndex = 0;

    regexResult.matches.forEach((m, i) => {
      // Add text before match
      if (m.index > lastIndex) {
        elements.push(testText.substring(lastIndex, m.index));
      }
      // Add highlighted match (if non-empty)
      if (m.text.length > 0) {
        elements.push(
          <mark key={i} className="regex-highlight" title={`Match #${i + 1} (index ${m.index})`}>
            {m.text}
          </mark>
        );
      }
      lastIndex = m.index + m.text.length;
    });

    if (lastIndex < testText.length) {
      elements.push(testText.substring(lastIndex));
    }

    return elements;
  }, [testText, regexResult]);

  const toolbar = (
    <div className="regex-toolbar">
      <div className="regex-pattern-input-group">
        <span className="regex-slash">/</span>
        <input
          type="text"
          className="dw-input regex-input text-mono"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regular expression pattern..."
          spellCheck={false}
        />
        <span className="regex-slash">/</span>
      </div>

      <div className="regex-flags">
        {['g', 'i', 'm', 's'].map(flag => (
          <button
            key={flag}
            className={`regex-flag-btn ${flags[flag] ? 'active' : ''}`}
            onClick={() => toggleFlag(flag)}
            title={`Toggle flag: ${flag}`}
          >
            {flag}
          </button>
        ))}
      </div>

      <div className="dw-btn-group">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            className="dw-btn dw-btn-secondary dw-btn-sm"
            onClick={() => loadPreset(p)}
            title={`Load ${p.name} preset`}
          >
            <Sparkles size={11} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const statusLeft = regexResult.error ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> Invalid RegEx: {regexResult.error}
    </span>
  ) : (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> {regexResult.matches.length} {regexResult.matches.length === 1 ? 'match' : 'matches'} found
    </span>
  );

  return (
    <ToolWorkspace
      toolId="regex-tester"
      input={testText}
      onInputChange={setTestText}
      inputLabel="Test String"
      outputLabel="Matches & Captures"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={<span>{testText.length} chars</span>}
      singlePanel={false}
      output={null}
      hideOutput={false}
    >
      <div className="regex-output-container">
        {/* Match Preview */}
        <div className="regex-preview-panel">
          <div className="regex-preview-title">Live Highlighted Preview</div>
          <div className="regex-preview-body">{highlightedText}</div>
        </div>

        {/* Matches Details */}
        <div className="regex-matches-list">
          <div className="regex-preview-title">
            <Layers size={14} />
            <span>Captured Groups & Matches</span>
          </div>

          {regexResult.matches.length === 0 ? (
            <div className="regex-no-match">No matches found in string</div>
          ) : (
            regexResult.matches.map((m, idx) => (
              <div key={idx} className="regex-match-card">
                <div className="regex-match-header">
                  <strong>Match #{idx + 1}</strong>
                  <span className="regex-match-pos">at index {m.index}</span>
                </div>
                <div className="regex-match-val">"{m.text}"</div>
                {m.groups.length > 0 && (
                  <div className="regex-groups-list">
                    {m.groups.map((grp, gIdx) => (
                      <div key={gIdx} className="regex-group-item">
                        <span className="regex-group-tag">Group #{gIdx + 1}:</span>
                        <span className="regex-group-val">"{grp}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default RegexTester;
