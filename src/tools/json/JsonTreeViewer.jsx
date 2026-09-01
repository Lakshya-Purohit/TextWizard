import React, { useState, useMemo } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { ChevronRight, ChevronDown, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import './JsonTreeViewer.css';

const TreeNode = ({ name, value, depth = 0, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const getType = (val) => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const type = getType(value);

  const renderValue = (val) => {
    if (val === null) return <span className="tree-val-null">null</span>;
    if (typeof val === 'string') return <span className="tree-val-string">"{val}"</span>;
    if (typeof val === 'number') return <span className="tree-val-number">{val}</span>;
    if (typeof val === 'boolean') return <span className="tree-val-boolean">{val.toString()}</span>;
    return <span>{String(val)}</span>;
  };

  if (!isObject) {
    return (
      <div className="tree-leaf" style={{ paddingLeft: `${depth * 18 + 18}px` }}>
        {name !== undefined && <span className="tree-key">{name}: </span>}
        {renderValue(value)}
      </div>
    );
  }

  const keys = Object.keys(value);
  const count = keys.length;

  return (
    <div className="tree-node">
      <div
        className="tree-branch-header"
        style={{ paddingLeft: `${depth * 18}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="tree-toggle-icon">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {name !== undefined && <span className="tree-key">{name}: </span>}
        <span className="tree-bracket">{isArray ? '[' : '{'}</span>
        {!isOpen && (
          <span className="tree-collapsed-preview">
            ... {count} {count === 1 ? 'item' : 'items'} ...
          </span>
        )}
        {!isOpen && <span className="tree-bracket">{isArray ? ']' : '}'}</span>}
      </div>

      {isOpen && (
        <div className="tree-branch-body">
          {keys.map((key) => (
            <TreeNode
              key={key}
              name={isArray ? undefined : key}
              value={value[key]}
              depth={depth + 1}
              defaultOpen={depth < 2}
            />
          ))}
          <div className="tree-branch-closing" style={{ paddingLeft: `${depth * 18 + 18}px` }}>
            <span className="tree-bracket">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const JsonTreeViewer = () => {
  const [input, setInput] = useState('{\n  "name": "DevWizard",\n  "version": 4,\n  "features": ["JSON", "XML", "JWT", "Diff"],\n  "settings": {\n    "theme": "dark",\n    "localOnly": true\n  }\n}');

  const parsedResult = useMemo(() => {
    if (!input.trim()) return { data: null, error: null };
    try {
      const parsed = JSON.parse(input);
      return { data: parsed, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [input]);

  const statusLeft = parsedResult.error ? (
    <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {parsedResult.error}
    </span>
  ) : parsedResult.data !== null ? (
    <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <CheckCircle size={12} /> Tree rendered
    </span>
  ) : null;

  return (
    <ToolWorkspace
      toolId="json-tree"
      input={input}
      onInputChange={setInput}
      inputLabel="JSON Input"
      outputLabel="Interactive Tree Viewer"
      statusLeft={statusLeft}
      statusRight={<span>{input.length} chars</span>}
      singlePanel={false}
      output={null}
      hideOutput={false}
    >
      <div className="json-tree-container">
        {parsedResult.error ? (
          <div className="dw-empty">
            <AlertCircle size={32} color="var(--accent-danger)" />
            <div className="dw-empty-title">Invalid JSON</div>
            <div className="dw-empty-desc">{parsedResult.error}</div>
          </div>
        ) : parsedResult.data !== null ? (
          <TreeNode value={parsedResult.data} depth={0} defaultOpen={true} />
        ) : (
          <div className="dw-empty">
            <div className="dw-empty-desc">Enter valid JSON to explore tree</div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default JsonTreeViewer;
