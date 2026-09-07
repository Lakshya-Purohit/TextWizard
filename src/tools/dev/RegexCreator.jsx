import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Wand2, Copy, Check, Plus, Trash2, Code2,
  CheckCircle, AlertCircle, Sparkles, BookOpen, Layers
} from 'lucide-react';
import './RegexCreator.css';

const PRESETS = [
  {
    id: 'email',
    name: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Matches standard email addresses (e.g. user@domain.com)',
    sampleText: 'Valid: user.name+tag@example.co.in\nInvalid: user@bad, @missing.com',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'class', value: '[a-zA-Z0-9._%+-]+', label: 'Username chars (letters, digits, ._%+-)' },
      { id: '3', type: 'literal', value: '@', label: 'Literal @ symbol' },
      { id: '4', type: 'class', value: '[a-zA-Z0-9.-]+', label: 'Domain name label' },
      { id: '5', type: 'literal', value: '\\.', label: 'Literal dot (.)' },
      { id: '6', type: 'class', value: '[a-zA-Z]{2,}', label: 'Top-level domain (2+ letters)' },
      { id: '7', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'indian-phone',
    name: 'Indian Mobile (+91)',
    pattern: '^(?:\\+91[\\-\\s]?)?[6789]\\d{9}$',
    description: 'Matches 10-digit Indian mobile numbers starting with 6-9, optional +91 prefix',
    sampleText: '+91 9876543210\n9876543210\n+91-8877665544\n1234567890 (invalid)',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'group', value: '(?:\\+91[\\-\\s]?)?', label: 'Optional +91 with optional hyphen/space' },
      { id: '3', type: 'class', value: '[6789]', label: 'Starts with 6, 7, 8, or 9' },
      { id: '4', type: 'class', value: '\\d{9}', label: 'Followed by exactly 9 digits' },
      { id: '5', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'url',
    name: 'Web URL (HTTP/HTTPS)',
    pattern: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: 'Validates web URLs with http/https and optional query parameters',
    sampleText: 'https://devwizard.io/tools/regex\nhttp://sub.domain.org:8080?q=test#hash',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'literal', value: 'https?:\\/\\/', label: 'http:// or https://' },
      { id: '3', type: 'group', value: '(?:www\\.)?', label: 'Optional www. subdomain' },
      { id: '4', type: 'class', value: '[-a-zA-Z0-9@:%._\\+~#=]{1,256}', label: 'Domain host name' },
      { id: '5', type: 'literal', value: '\\.[a-zA-Z0-9()]{1,6}\\b', label: 'Domain TLD extension' },
      { id: '6', type: 'group', value: '(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', label: 'Optional URL path and query parameters' },
      { id: '7', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'date-iso',
    name: 'Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$',
    description: 'Matches standard ISO dates with valid months 01-12 and days 01-31',
    sampleText: '2026-09-08\n1999-12-31\n2026-13-45 (invalid)',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'class', value: '\\d{4}', label: '4-digit Year (YYYY)' },
      { id: '3', type: 'literal', value: '-', label: 'Hyphen delimiter' },
      { id: '4', type: 'group', value: '(?:0[1-9]|1[0-2])', label: 'Valid Month (01-12)' },
      { id: '5', type: 'literal', value: '-', label: 'Hyphen delimiter' },
      { id: '6', type: 'group', value: '(?:0[1-9]|[12]\\d|3[01])', label: 'Valid Day (01-31)' },
      { id: '7', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'Matches valid IPv4 addresses (0.0.0.0 to 255.255.255.255)',
    sampleText: '192.168.1.1\n10.0.0.255\n256.100.0.1 (invalid)',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'group', value: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}', label: 'First 3 octets (0-255) with dot' },
      { id: '3', type: 'group', value: '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)', label: 'Final 4th octet (0-255)' },
      { id: '4', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'uuid',
    name: 'UUID / GUID',
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    description: 'Matches 8-4-4-4-12 hex UUID/GUID format',
    sampleText: 'd9fcdd6a-ec3c-41ff-8727-535b9e77c8c7\n123e4567-e89b-12d3-a456-426614174000',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'class', value: '[0-9a-fA-F]{8}', label: '8 hex characters' },
      { id: '3', type: 'literal', value: '-', label: 'Hyphen' },
      { id: '4', type: 'class', value: '[0-9a-fA-F]{4}', label: '4 hex characters' },
      { id: '5', type: 'literal', value: '-', label: 'Hyphen' },
      { id: '6', type: 'class', value: '[0-9a-fA-F]{4}', label: '4 hex characters' },
      { id: '7', type: 'literal', value: '-', label: 'Hyphen' },
      { id: '8', type: 'class', value: '[0-9a-fA-F]{4}', label: '4 hex characters' },
      { id: '9', type: 'literal', value: '-', label: 'Hyphen' },
      { id: '10', type: 'class', value: '[0-9a-fA-F]{12}', label: '12 hex characters' },
      { id: '11', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'password',
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char',
    sampleText: 'Pass@word123 (valid)\nweakpass (invalid)',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'lookahead', value: '(?=.*[a-z])', label: 'Lookahead: At least 1 lowercase letter' },
      { id: '3', type: 'lookahead', value: '(?=.*[A-Z])', label: 'Lookahead: At least 1 uppercase letter' },
      { id: '4', type: 'lookahead', value: '(?=.*\\d)', label: 'Lookahead: At least 1 number digit' },
      { id: '5', type: 'lookahead', value: '(?=.*[@$!%*?&])', label: 'Lookahead: At least 1 special symbol' },
      { id: '6', type: 'class', value: '[A-Za-z\\d@$!%*?&]{8,}', label: '8 or more permitted characters' },
      { id: '7', type: 'end', value: '$', label: 'Ends with string' },
    ]
  },
  {
    id: 'hex-color',
    name: 'Hex Color (#fff)',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'Matches 3 or 6 hex digit CSS color codes with # prefix',
    sampleText: '#3b82f6\n#fff\n#0E1017\n#12345 (invalid)',
    blocks: [
      { id: '1', type: 'start', value: '^', label: 'Starts with string' },
      { id: '2', type: 'literal', value: '#', label: 'Literal hash sign #' },
      { id: '3', type: 'group', value: '([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', label: 'Either 6 or 3 hex characters' },
      { id: '4', type: 'end', value: '$', label: 'Ends with string' },
    ]
  }
];

const RegexCreator = () => {
  const { showToast } = useApp();
  const [selectedPreset, setSelectedPreset] = useState('email');
  const [blocks, setBlocks] = useState(() => PRESETS[0].blocks);
  const [flags, setFlags] = useState({ g: true, i: true, m: true, s: false });
  const [testText, setTestText] = useState(() => PRESETS[0].sampleText);
  const [targetCodeLang, setTargetCodeLang] = useState('js'); // js | python | java | go | csharp
  const [copied, setCopied] = useState(false);

  // Compile active regex string from blocks
  const compiledPattern = useMemo(() => {
    return blocks.map(b => b.value).join('');
  }, [blocks]);

  const flagStr = useMemo(() => {
    return Object.keys(flags).filter(k => flags[k]).join('');
  }, [flags]);

  const toggleFlag = (f) => {
    setFlags(prev => ({ ...prev, [f]: !prev[f] }));
  };

  // Select a preset
  const handleSelectPreset = (pId) => {
    setSelectedPreset(pId);
    const p = PRESETS.find(x => x.id === pId);
    if (p) {
      setBlocks(p.blocks);
      setTestText(p.sampleText);
      showToast(`Loaded "${p.name}" regex template`, 'info');
    }
  };

  // Add a new custom block
  const handleAddBlock = (type) => {
    const newId = String(Date.now());
    let newBlock = { id: newId, type, value: '', label: '' };

    if (type === 'digits') {
      newBlock = { id: newId, type: 'class', value: '\\d+', label: '1 or more digits (0-9)' };
    } else if (type === 'letters') {
      newBlock = { id: newId, type: 'class', value: '[a-zA-Z]+', label: '1 or more letters (a-z, A-Z)' };
    } else if (type === 'word') {
      newBlock = { id: newId, type: 'class', value: '\\w+', label: 'Word characters (letters, numbers, _)' };
    } else if (type === 'whitespace') {
      newBlock = { id: newId, type: 'class', value: '\\s+', label: 'Whitespace characters' };
    } else if (type === 'boundary') {
      newBlock = { id: newId, type: 'boundary', value: '\\b', label: 'Word boundary (\\b)' };
    } else {
      newBlock = { id: newId, type: 'literal', value: 'custom', label: 'Literal match: "custom"' };
    }

    setBlocks(prev => [...prev, newBlock]);
    setSelectedPreset('');
  };

  // Remove block
  const handleRemoveBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedPreset('');
  };

  // Update block value
  const handleUpdateBlockValue = (id, val) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, value: val } : b));
    setSelectedPreset('');
  };

  // Test regex against testText
  const testResults = useMemo(() => {
    if (!compiledPattern) return { matches: [], error: null };
    try {
      const reg = new RegExp(compiledPattern, flagStr);
      const matches = [];

      if (flags.g) {
        let m;
        let lastIdx = -1;
        while ((m = reg.exec(testText)) !== null) {
          if (m.index === lastIdx) break;
          lastIdx = m.index;
          matches.push({ text: m[0], index: m.index });
        }
      } else {
        const m = reg.exec(testText);
        if (m) matches.push({ text: m[0], index: m.index });
      }

      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [compiledPattern, flagStr, testText, flags.g]);

  // Highlight matches in test text
  const highlightedPreview = useMemo(() => {
    if (!testResults.matches.length || testResults.error) return testText;

    const elements = [];
    let lastIndex = 0;

    testResults.matches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        elements.push(testText.substring(lastIndex, m.index));
      }
      elements.push(
        <mark key={idx} className="rc-match-highlight" title={`Match #${idx + 1}`}>
          {m.text}
        </mark>
      );
      lastIndex = m.index + m.text.length;
    });

    if (lastIndex < testText.length) {
      elements.push(testText.substring(lastIndex));
    }

    return elements;
  }, [testText, testResults]);

  // Code Snippet Generator
  const codeSnippet = useMemo(() => {
    const escapedPattern = compiledPattern.replace(/\\/g, '\\\\');
    if (targetCodeLang === 'js') {
      return `// JavaScript / TypeScript\nconst regex = /${compiledPattern}/${flagStr};\nconst isMatch = regex.test(text);\nconst matches = text.match(regex);`;
    }
    if (targetCodeLang === 'python') {
      return `# Python\nimport re\n\npattern = re.compile(r"${compiledPattern}")\nmatches = pattern.findall(text)`;
    }
    if (targetCodeLang === 'java') {
      return `// Java\nimport java.util.regex.Pattern;\nimport java.util.regex.Matcher;\n\nPattern pattern = Pattern.compile("${escapedPattern}");\nMatcher matcher = pattern.matcher(text);\nboolean isMatch = matcher.find();`;
    }
    if (targetCodeLang === 'go') {
      return `// Go (Golang)\npackage main\nimport "regexp"\n\nvar re = regexp.MustCompile(\`${compiledPattern}\`)\nmatches := re.FindAllString(text, -1)`;
    }
    if (targetCodeLang === 'csharp') {
      return `// C# (.NET)\nusing System.Text.RegularExpressions;\n\nvar regex = new Regex(@"${compiledPattern.replace(/"/g, '""')}");\nMatchCollection matches = regex.Matches(text);`;
    }
    return '';
  }, [compiledPattern, flagStr, targetCodeLang]);

  const copyRegex = () => {
    navigator.clipboard.writeText(`/${compiledPattern}/${flagStr}`);
    setCopied(true);
    showToast('Copied regex to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolWorkspace
      toolId="regex-creator"
      singlePanel={true}
      statusLeft={
        testResults.error ? (
          <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> Invalid Regex: {testResults.error}
          </span>
        ) : (
          <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Valid Pattern • {testResults.matches.length} matches found
          </span>
        )
      }
      statusRight={
        <span>
          Pattern Length: <strong>{compiledPattern.length}</strong> chars • Flags: <strong>/{flagStr}</strong>
        </span>
      }
    >
      <div className="rc-container">
        {/* Hero Pattern Bar */}
        <div className="rc-pattern-hero">
          <div className="rc-pattern-display">
            <span className="rc-pattern-slash">/</span>
            <span className="rc-pattern-body">{compiledPattern || '(empty)'}</span>
            <span className="rc-pattern-slash">/</span>
            <span className="rc-pattern-flags">{flagStr}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="rc-flags-bar">
              {['g', 'i', 'm', 's'].map(f => (
                <button
                  key={f}
                  className={`rc-flag-btn ${flags[f] ? 'active' : ''}`}
                  onClick={() => toggleFlag(f)}
                  title={`Toggle flag: ${f}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              className="dw-btn dw-btn-primary dw-btn-sm"
              onClick={copyRegex}
              title="Copy regex to clipboard"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy Regex</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Presets
          </span>
          <div className="rc-presets-wrap">
            {PRESETS.map(p => (
              <button
                key={p.id}
                className={`rc-preset-chip ${selectedPreset === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p.id)}
              >
                <Sparkles size={11} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Responsive Workspace */}
        <div className="rc-main-grid">
          {/* Left Column: Visual Rule Blocks Constructor */}
          <div className="rc-section">
            <div className="rc-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={13} />
                <span>Pattern Rule Blocks</span>
              </div>
              <div className="dw-btn-group">
                <button
                  className="dw-btn dw-btn-secondary dw-btn-sm"
                  onClick={() => handleAddBlock('digits')}
                  title="Add Digits Block"
                >
                  <Plus size={11} />
                  <span>Digits</span>
                </button>
                <button
                  className="dw-btn dw-btn-secondary dw-btn-sm"
                  onClick={() => handleAddBlock('letters')}
                  title="Add Letters Block"
                >
                  <Plus size={11} />
                  <span>Letters</span>
                </button>
                <button
                  className="dw-btn dw-btn-secondary dw-btn-sm"
                  onClick={() => handleAddBlock('literal')}
                  title="Add Custom Literal Block"
                >
                  <Plus size={11} />
                  <span>Text</span>
                </button>
              </div>
            </div>

            <div className="rc-section-content">
              {blocks.map((block, idx) => (
                <div key={block.id} className="rc-block-item">
                  <span className="rc-step-badge">{idx + 1}</span>
                  <span className="rc-block-type">{block.type}</span>
                  <input
                    type="text"
                    className="rc-block-input"
                    value={block.value}
                    onChange={(e) => handleUpdateBlockValue(block.id, e.target.value)}
                    placeholder="Regex token..."
                    spellCheck={false}
                  />
                  <button
                    className="rc-block-remove"
                    onClick={() => handleRemoveBlock(block.id)}
                    title="Remove rule block"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {blocks.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  No pattern blocks. Select a preset above or add a new block.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Step-by-Step Plain English Explanation */}
          <div className="rc-section">
            <div className="rc-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={13} />
                <span>Human-Readable Explanation</span>
              </div>
            </div>

            <div className="rc-section-content">
              <div className="rc-explanation-list">
                {blocks.map((b, idx) => (
                  <div key={b.id} className="rc-explanation-step">
                    <span className="rc-step-badge">{idx + 1}</span>
                    <div>
                      <span className="rc-step-pattern">{b.value}</span>
                      <span>{b.label || `Matches pattern "${b.value}"`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Testing Area */}
        <div className="rc-section">
          <div className="rc-section-header">
            <span>Live Interactive Tester</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-success)' }}>
              {testResults.matches.length} {testResults.matches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="rc-section-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Input Test Text:
                </span>
                <textarea
                  className="rc-test-input"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Paste text here to test against the regex..."
                  spellCheck={false}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Match Preview:
                </span>
                <div className="rc-matches-preview">
                  {highlightedPreview}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Generator */}
        <div className="rc-section">
          <div className="rc-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={13} />
              <span>Multi-Language Code Snippet</span>
            </div>
            <div className="dw-tabs" style={{ border: 'none', gap: '4px' }}>
              {['js', 'python', 'java', 'go', 'csharp'].map(lang => (
                <button
                  key={lang}
                  className={`dw-tab ${targetCodeLang === lang ? 'active' : ''}`}
                  onClick={() => setTargetCodeLang(lang)}
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="rc-section-content">
            <div className="rc-code-box">
              {codeSnippet}
            </div>
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
};

export default RegexCreator;
