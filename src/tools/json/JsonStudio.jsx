import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  Braces, TreePine, ArrowLeftRight, Quote,
  CheckCircle2, AlertCircle,
  Search, ChevronDown, Wand2, ChevronRight
} from 'lucide-react';  
import Papa from 'papaparse';
import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import './JsonStudio.css';

/* ============================================================
   Helper Utilities for JSON Processing
   ============================================================ */

function tryAutoRepairJson(raw) {
  let text = raw.trim();
  // Replace trailing commas before } or ]
  text = text.replace(/,\s*([}\]])/g, '$1');
  // Replace single quotes around keys/values with double quotes
  text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  // Quote unquoted object keys: { foo: "bar" } -> { "foo": "bar" }
  text = text.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');
  return text;
}

function sortJsonKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  } else if (value !== null && typeof value === 'object') {
    const sorted = {};
    Object.keys(value).sort().forEach(key => {
      sorted[key] = sortJsonKeys(value[key]);
    });
    return sorted;
  }
  return value;
}

function flattenObject(ob, prefix = '', result = {}) {
  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      const key = prefix ? `${prefix}.${i}` : i;
      if (typeof ob[i] === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
        flattenObject(ob[i], key, result);
      } else if (Array.isArray(ob[i])) {
        result[key] = JSON.stringify(ob[i]);
      } else {
        result[key] = ob[i];
      }
    }
  }
  return result;
}

/* ============================================================
   Tree Node Component for Interactive Tree Tab
   ============================================================ */
const TreeNode = ({ keyName, value, path, searchQuery, onCopyPath }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const displayPath = path || keyName || '$';

  // Highlight matches
  const isMatch = useMemo(() => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    const kMatch = String(keyName).toLowerCase().includes(q);
    const vMatch = !isObject && String(value).toLowerCase().includes(q);
    return kMatch || vMatch;
  }, [searchQuery, keyName, value, isObject]);

  if (!isObject) {
    let valTypeClass = 'val-string';
    let valFormatted = JSON.stringify(value);
    if (typeof value === 'number') valTypeClass = 'val-number';
    else if (typeof value === 'boolean') valTypeClass = 'val-boolean';
    else if (value === null) valTypeClass = 'val-null';

    return (
      <div className={`tree-leaf-row ${isMatch ? 'highlight-match' : ''}`}>
        {keyName !== undefined && <span className="tree-key">{keyName}: </span>}
        <span className={`tree-val ${valTypeClass}`}>{valFormatted}</span>
        <button
          className="tree-path-btn"
          title={`Copy path: ${displayPath}`}
          onClick={() => onCopyPath(displayPath)}
        >
          {displayPath}
        </button>
      </div>
    );
  }

  const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
  const count = entries.length;

  return (
    <div className="tree-branch">
      <div className={`tree-branch-header ${isMatch ? 'highlight-match' : ''}`}>
        <button
          className="tree-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {keyName !== undefined && <span className="tree-key">{keyName}: </span>}
        <span className="tree-bracket">{isArray ? '[' : '{'}</span>
        <span className="tree-count">{count} {count === 1 ? 'item' : 'items'}</span>
        <span className="tree-bracket">{isArray ? ']' : '}'}</span>
        <button
          className="tree-path-btn"
          title={`Copy path: ${displayPath}`}
          onClick={() => onCopyPath(displayPath)}
        >
          {displayPath}
        </button>
      </div>

      {!collapsed && (
        <div className="tree-branch-children">
          {entries.map(([k, v]) => {
            const nextPath = isArray ? `${displayPath}[${k}]` : `${displayPath}.${k}`;
            return (
              <TreeNode
                key={k}
                keyName={k}
                value={v}
                path={nextPath}
                searchQuery={searchQuery}
                onCopyPath={onCopyPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   Main Unified JsonStudio Component
   ============================================================ */
const JsonStudio = ({ defaultTab = 'format' }) => {
  const { showToast } = useApp();

  // Active Tab: 'format' | 'tree' | 'escape' | 'convert'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [input, setInput] = useState(
    '{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "service": "DevWizard Unified JSON Studio",\n    "version": "4.0.0",\n    "features": [\n      "Format & Minify",\n      "Interactive Tree Explorer",\n      "Code Escaper & Log Unescaper",\n      "CSV / YAML / XML Converter"\n    ],\n    "secure": true\n  }\n}'
  );
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [validation, setValidation] = useState({ valid: true, message: 'Valid JSON' });
  const [parsedData, setParsedData] = useState(null);

  // Tab Specific States
  // Format Tab
  const [isSorted, setIsSorted] = useState(false);
  // Tree Tab
  const [treeSearch, setTreeSearch] = useState('');
  // Escape Tab
  const [escapeLang, setEscapeLang] = useState('javascript'); // 'javascript' | 'python' | 'csharp' | 'java' | 'sql'
  const [escapeDirection, setEscapeDirection] = useState('escape'); // 'escape' | 'unescape'
  // Convert Tab
  const [convertTarget, setConvertTarget] = useState('yaml'); // 'yaml' | 'csv' | 'xml'
  const [convertDirection, setConvertDirection] = useState('json-to-target');

  // Debounced Parsing & Operation Execution
  const executeOperation = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setValidation({ valid: true, message: 'Ready — waiting for input' });
      setParsedData(null);
      return;
    }

    // 1. In unescape mode or target-to-json mode, we parse differently
    if (activeTab === 'escape' && escapeDirection === 'unescape') {
      try {
        let unescaped = input.trim();
        // Remove enclosing quotes if present
        if ((unescaped.startsWith('"') && unescaped.endsWith('"')) || (unescaped.startsWith("'") && unescaped.endsWith("'"))) {
          unescaped = unescaped.slice(1, -1);
        }
        // Unescape standard escaped characters
        unescaped = unescaped
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t');

        const parsed = JSON.parse(unescaped);
        setOutput(JSON.stringify(parsed, null, indent));
        setValidation({ valid: true, message: 'Unescaped & formatted cleanly' });
        setParsedData(parsed);
      } catch (err) {
        setOutput(input);
        setValidation({ valid: false, message: `Unescape failed: ${err.message}` });
      }
      return;
    }

    if (activeTab === 'convert' && convertDirection === 'target-to-json') {
      try {
        let resultObj = null;
        if (convertTarget === 'yaml') {
          resultObj = yaml.load(input);
        } else if (convertTarget === 'xml') {
          const parser = new XMLParser({ ignoreAttributes: false });
          resultObj = parser.parse(input);
        } else if (convertTarget === 'csv') {
          const parsedCsv = Papa.parse(input, { header: true, skipEmptyLines: true });
          resultObj = parsedCsv.data;
        }
        setOutput(JSON.stringify(resultObj, null, indent));
        setValidation({ valid: true, message: `Converted ${convertTarget.toUpperCase()} to JSON` });
        setParsedData(resultObj);
      } catch (err) {
        setOutput('');
        setValidation({ valid: false, message: `Conversion error: ${err.message}` });
      }
      return;
    }

    // Standard JSON input parsing
    try {
      let parsed = JSON.parse(input);
      setParsedData(parsed);
      setValidation({ valid: true, message: 'Valid JSON' });

      // TAB 1: Format & Validate
      if (activeTab === 'format') {
        if (isSorted) {
          parsed = sortJsonKeys(parsed);
        }
        if (indent === 0) {
          setOutput(JSON.stringify(parsed));
        } else {
          setOutput(JSON.stringify(parsed, null, indent));
        }
      }

      // TAB 2: Tree Inspector
      else if (activeTab === 'tree') {
        // Output can mirror formatted JSON or stats
        setOutput(JSON.stringify(parsed, null, 2));
      }

      // TAB 3: Escape / Stringify for programming languages
      else if (activeTab === 'escape') {
        const minified = JSON.stringify(parsed);
        let escaped = '';

        switch (escapeLang) {
          case 'javascript':
            escaped = JSON.stringify(minified);
            break;
          case 'python':
            escaped = `json_str = ${JSON.stringify(minified)}`;
            break;
          case 'csharp':
            escaped = `string json = @"${minified.replace(/"/g, '""')}";`;
            break;
          case 'java':
            escaped = `String json = "${minified.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`;
            break;
          case 'sql':
            escaped = `'${minified.replace(/'/g, "''")}'`;
            break;
          default:
            escaped = JSON.stringify(minified);
        }
        setOutput(escaped);
      }

      // TAB 4: Converter (JSON to CSV, YAML, XML)
      else if (activeTab === 'convert') {
        if (convertTarget === 'yaml') {
          setOutput(yaml.dump(parsed, { indent: 2 }));
        } else if (convertTarget === 'xml') {
          const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
          const wrapped = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
            ? { root: parsed }
            : { items: { item: parsed } };
          setOutput(`<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(wrapped)}`);
        } else if (convertTarget === 'csv') {
          const arrayData = Array.isArray(parsed) ? parsed : [parsed];
          const flattened = arrayData.map(item =>
            typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }
          );
          setOutput(Papa.unparse(flattened));
        }
      }
    } catch (err) {
      setParsedData(null);
      // Syntax error detail extraction
      const msg = err.message;
      setValidation({ valid: false, message: `Syntax Error: ${msg}` });
      if (activeTab === 'format') {
        setOutput('');
      }
    }
  }, [input, activeTab, indent, isSorted, escapeLang, escapeDirection, convertTarget, convertDirection]);

  useEffect(() => {
    executeOperation();
  }, [executeOperation]);

  // Quick Action: Auto-repair common JSON errors
  const handleAutoRepair = () => {
    try {
      const repaired = tryAutoRepairJson(input);
      const parsed = JSON.parse(repaired);
      setInput(JSON.stringify(parsed, null, indent));
      showToast('JSON repaired successfully', 'success');
    } catch (err) {
      showToast('Could not automatically repair JSON: ' + err.message, 'error');
    }
  };

  // Quick Action: Minify
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setIndent(0);
      setOutput(JSON.stringify(parsed));
      showToast('Minified JSON', 'info');
    } catch {
      showToast('Invalid JSON cannot be minified', 'error');
    }
  };

  // Quick Action: Prettify 2
  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(input);
      setIndent(2);
      setOutput(JSON.stringify(parsed, null, 2));
      showToast('Formatted with 2-space indentation', 'info');
    } catch {
      showToast('Invalid JSON cannot be formatted', 'error');
    }
  };

  // Tree Path Copy
  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
    showToast(`Copied path: ${path}`, 'success');
  };

  // Custom Toolbar
  const toolbar = (
    <div className="json-studio-toolbar">
      {/* Tab Switcher Pills */}
      <div className="json-nav-pills">
        <button
          type="button"
          className={`json-nav-pill ${activeTab === 'format' ? 'active' : ''}`}
          onClick={() => setActiveTab('format')}
        >
          <Braces size={13} />
          <span>Format & Validate</span>
        </button>
        <button
          type="button"
          className={`json-nav-pill ${activeTab === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('tree')}
        >
          <TreePine size={13} />
          <span>Tree Inspector</span>
        </button>
        <button
          type="button"
          className={`json-nav-pill ${activeTab === 'escape' ? 'active' : ''}`}
          onClick={() => setActiveTab('escape')}
        >
          <Quote size={13} />
          <span>Stringify & Logs</span>
        </button>
        <button
          type="button"
          className={`json-nav-pill ${activeTab === 'convert' ? 'active' : ''}`}
          onClick={() => setActiveTab('convert')}
        >
          <ArrowLeftRight size={13} />
          <span>Convert (YAML/CSV/XML)</span>
        </button>
      </div>

      {/* Tab Contextual Actions */}
      {activeTab === 'format' && (
        <div className="json-context-actions">
          <button type="button" className="dw-btn dw-btn-ghost dw-btn-sm" onClick={handlePrettify}>
            Prettify
          </button>
          <button type="button" className="dw-btn dw-btn-ghost dw-btn-sm" onClick={handleMinify}>
            Minify
          </button>
          <button
            type="button"
            className={`dw-btn dw-btn-ghost dw-btn-sm ${isSorted ? 'active' : ''}`}
            onClick={() => setIsSorted(!isSorted)}
          >
            Sort Keys
          </button>
          <button type="button" className="dw-btn dw-btn-ghost dw-btn-sm" onClick={handleAutoRepair} title="Fix trailing commas & unquoted keys">
            <Wand2 size={12} />
            <span>Repair</span>
          </button>
        </div>
      )}

      {activeTab === 'escape' && (
        <div className="json-context-actions">
          <div className="dw-btn-group">
            <button
              type="button"
              className={`dw-btn dw-btn-xs ${escapeDirection === 'escape' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
              onClick={() => setEscapeDirection('escape')}
            >
              JSON → String
            </button>
            <button
              type="button"
              className={`dw-btn dw-btn-xs ${escapeDirection === 'unescape' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
              onClick={() => setEscapeDirection('unescape')}
            >
              Unescape Logs
            </button>
          </div>
          {escapeDirection === 'escape' && (
            <select
              className="json-select"
              value={escapeLang}
              onChange={e => setEscapeLang(e.target.value)}
            >
              <option value="javascript">JS/TS</option>
              <option value="python">Python</option>
              <option value="csharp">C# (@"")</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          )}
        </div>
      )}

      {activeTab === 'convert' && (
        <div className="json-context-actions">
          <div className="dw-btn-group">
            <button
              type="button"
              className={`dw-btn dw-btn-xs ${convertDirection === 'json-to-target' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
              onClick={() => setConvertDirection('json-to-target')}
            >
              JSON → {convertTarget.toUpperCase()}
            </button>
            <button
              type="button"
              className={`dw-btn dw-btn-xs ${convertDirection === 'target-to-json' ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
              onClick={() => setConvertDirection('target-to-json')}
            >
              {convertTarget.toUpperCase()} → JSON
            </button>
          </div>
          <div className="dw-btn-group">
            {['yaml', 'csv', 'xml'].map(fmt => (
              <button
                key={fmt}
                type="button"
                className={`dw-btn dw-btn-xs ${convertTarget === fmt ? 'dw-btn-primary' : 'dw-btn-secondary'}`}
                onClick={() => setConvertTarget(fmt)}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const snippetOptions = {
    tab: activeTab,
    convertTarget,
    convertDirection,
    input,
    outputData: output,
  };

  return (
    <ToolWorkspace
      toolId="json-studio"
      toolbar={toolbar}
      snippetOptions={snippetOptions}
      statusLeft={
        validation.valid ? (
          <span className="json-status-valid">
            <CheckCircle2 size={13} /> {validation.message}
          </span>
        ) : (
          <span className="json-status-invalid">
            <AlertCircle size={13} /> {validation.message}
          </span>
        )
      }
      statusRight={
        <span className="json-status-right font-mono">
          {parsedData ? (Array.isArray(parsedData) ? `Array (${parsedData.length})` : `Object (${Object.keys(parsedData).length} keys)`) : 'Raw'}
        </span>
      }
      inputLabel={
        activeTab === 'convert' && convertDirection === 'target-to-json'
          ? `${convertTarget.toUpperCase()} Input`
          : activeTab === 'escape' && escapeDirection === 'unescape'
            ? 'Escaped Log String Input'
            : 'JSON Input'
      }
      outputLabel={
        activeTab === 'tree'
          ? 'Interactive Visual Tree'
          : activeTab === 'convert' && convertDirection === 'json-to-target'
            ? `${convertTarget.toUpperCase()} Output`
            : activeTab === 'escape' && escapeDirection === 'escape'
              ? `${escapeLang.toUpperCase()} Code String`
              : 'Formatted JSON Output'
      }
      input={input}
      output={activeTab === 'tree' ? null : output}
      onInputChange={setInput}
      errorMessage={validation.valid ? null : validation.message}
    >
      {/* Special Content Rendering ONLY for Tree Inspector */}
      {activeTab === 'tree' ? (
        <div className="json-tree-workspace">
          <div className="json-tree-search-bar">
            <Search size={13} className="text-secondary" />
            <input
              type="text"
              className="json-tree-search-input"
              value={treeSearch}
              onChange={e => setTreeSearch(e.target.value)}
              placeholder="Search keys and values across the JSON tree..."
            />
            {treeSearch && (
              <button
                type="button"
                className="dw-btn dw-btn-ghost dw-btn-xs"
                onClick={() => setTreeSearch('')}
              >
                Clear
              </button>
            )}
          </div>

          <div className="json-tree-content font-mono">
            {parsedData !== null ? (
              <TreeNode
                value={parsedData}
                searchQuery={treeSearch}
                onCopyPath={handleCopyPath}
              />
            ) : (
              <div className="json-tree-empty">
                <AlertCircle size={18} className="text-danger" />
                <span>Provide valid JSON on the left to inspect its hierarchical structure.</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </ToolWorkspace>
  );
};

export default JsonStudio;
