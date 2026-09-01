import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { Regex, CheckCircle, AlertCircle, Layers } from 'lucide-react';
import './RegexTester.css';

const RegexTester = () => {
  const [pattern, setPattern] = useState('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState('Contact us at support@devwizard.io or sales-team@company.org for any inquiries.');

  const toggleFlag = (flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const regexResult = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
      const regex = new RegExp(pattern, flagStr);

      const matches = [];
      if (flags.g) {
        let match;
        let lastIdx = -1;
        while ((match = regex.exec(testText)) !== null) {
          if (match.index === lastIdx) break; // avoid infinite loop on empty pattern match
          lastIdx = match.index;
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
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
      // Add highlighted match
      elements.push(
        <mark key={i} className="regex-highlight" title={`Match #${i + 1}`}>
          {m.text}
        </mark>
      );
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
          className="dw-input regex-input"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Regular expression..."
        />
        <span className="regex-slash">/</span>
      </div>

      <div className="regex-flags">
        {['g', 'i', 'm', 's'].map(flag => (
          <button
            key={flag}
            className={`regex-flag-btn ${flags[flag] ? 'active' : ''}`}
            onClick={() => toggleFlag(flag)}
            title={`Flag: ${flag}`}
          >
            {flag}
          </button>
        ))}
      </div>
    </div>
  );

  const statusLeft = regexResult.error ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {regexResult.error}
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
