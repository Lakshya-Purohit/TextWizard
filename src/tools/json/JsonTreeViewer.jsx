import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ToolWorkspace from '../ToolWorkspace';
import { useApp } from '../../context/AppContext';
import {
  ChevronRight, ChevronDown, CheckCircle, AlertCircle,
  Search, Copy, ChevronsUpDown, ChevronsDownUp, Loader2,
  FileCode2
} from 'lucide-react';
import './JsonTreeViewer.css';

const TreeNode = ({
  name,
  value,
  depth = 0,
  path = '',
  searchFilter = '',
  expandedMap,
  toggleExpand,
  onCopyPath,
  onCopyValue
}) => {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const currentPath = path ? (isArray ? `${path}[${name}]` : `${path}.${name}`) : name || 'root';
  const isExpanded = expandedMap[currentPath] !== undefined ? expandedMap[currentPath] : depth < 2;

  const matchesFilter = useCallback((k, v) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    if (k && String(k).toLowerCase().includes(term)) return true;
    if (v === null && 'null'.includes(term)) return true;
    if (typeof v !== 'object' && String(v).toLowerCase().includes(term)) return true;
    if (typeof v === 'object' && v !== null) {
      try {
        return JSON.stringify(v).toLowerCase().includes(term);
      } catch {
        return false;
      }
    }
    return false;
  }, [searchFilter]);

  if (!matchesFilter(name, value)) {
    return null;
  }

  const renderValue = (val) => {
    if (val === null) return <span className="tree-val-null">null</span>;
    if (typeof val === 'string') return <span className="tree-val-string">"{val}"</span>;
    if (typeof val === 'number') return <span className="tree-val-number">{val}</span>;
    if (typeof val === 'boolean') return <span className="tree-val-boolean">{val.toString()}</span>;
    return <span className="tree-val-other">{String(val)}</span>;
  };

  const getTypeBadge = (val) => {
    if (val === null) return <span className="tree-type-badge badge-null">null</span>;
    if (Array.isArray(val)) return <span className="tree-type-badge badge-arr">arr[{val.length}]</span>;
    if (typeof val === 'object') return <span className="tree-type-badge badge-obj">obj{`{${Object.keys(val).length}}`}</span>;
    if (typeof val === 'string') return <span className="tree-type-badge badge-str">str</span>;
    if (typeof val === 'number') return <span className="tree-type-badge badge-num">num</span>;
    if (typeof val === 'boolean') return <span className="tree-type-badge badge-bool">bool</span>;
    return null;
  };

  if (!isObject) {
    return (
      <div className="tree-leaf" style={{ paddingLeft: `${depth * 18 + 18}px` }}>
        <div className="tree-leaf-content">
          {name !== undefined && <span className="tree-key">{name}: </span>}
          {renderValue(value)}
          {getTypeBadge(value)}
        </div>
        <div className="tree-node-actions">
          <button
            className="tree-mini-btn"
            title={`Copy path: ${currentPath}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopyPath(currentPath);
            }}
          >
            <Copy size={10} />
            <span>Path</span>
          </button>
          <button
            className="tree-mini-btn"
            title="Copy value"
            onClick={(e) => {
              e.stopPropagation();
              onCopyValue(value);
            }}
          >
            <Copy size={10} />
            <span>Value</span>
          </button>
        </div>
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
        onClick={() => toggleExpand(currentPath, !isExpanded)}
      >
        <span className="tree-toggle-icon">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {name !== undefined && <span className="tree-key">{name}: </span>}
        <span className="tree-bracket">{isArray ? '[' : '{'}</span>
        
        {!isExpanded && (
          <span className="tree-collapsed-preview">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
        
        {getTypeBadge(value)}
        
        {!isExpanded && <span className="tree-bracket">{isArray ? ']' : '}'}</span>}

        <div className="tree-node-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="tree-mini-btn"
            title={`Copy path: ${currentPath}`}
            onClick={() => onCopyPath(currentPath)}
          >
            <Copy size={10} />
            <span>Path</span>
          </button>
          <button
            className="tree-mini-btn"
            title="Copy JSON subtree"
            onClick={() => onCopyValue(value)}
          >
            <Copy size={10} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="tree-branch-body">
          {keys.map((key) => (
            <TreeNode
              key={key}
              name={isArray ? key : key}
              value={value[key]}
              depth={depth + 1}
              path={currentPath}
              searchFilter={searchFilter}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              onCopyPath={onCopyPath}
              onCopyValue={onCopyValue}
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
  const { showToast } = useApp();
  const [input, setInput] = useState(
    JSON.stringify(
      {
        projectName: "DevWizard Workspace",
        version: "4.2.0",
        active: true,
        stats: {
          totalTools: 14,
          localProcessingOnly: true,
          latencyMs: 0.12
        },
        supportedCategories: [
          { id: "json", name: "JSON Utilities", count: 3 },
          { id: "diff", name: "Side-by-Side Diff", count: 1 },
          { id: "encoding", name: "Encoders & Decoders", count: 3 },
          { id: "dev", name: "Security & Timestamps", count: 4 }
        ],
        author: {
          organization: "DevWizard Core",
          verified: true
        }
      },
      null,
      2
    )
  );

  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedMap, setExpandedMap] = useState({});
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Debounced parsing with loader state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setParsedData(null);
        setParseError(null);
        setIsLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(input);
        setParsedData(parsed);
        setParseError(null);
      } catch (e) {
        setParsedData(null);
        setParseError(e.message);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [input]);

  const toggleExpand = useCallback((path, state) => {
    setExpandedMap(prev => ({ ...prev, [path]: state }));
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!parsedData) return;
    const newMap = {};
    const traverse = (obj, path = 'root') => {
      if (obj && typeof obj === 'object') {
        newMap[path] = true;
        Object.keys(obj).forEach(k => {
          const childPath = Array.isArray(obj) ? `${path}[${k}]` : `${path}.${k}`;
          traverse(obj[k], childPath);
        });
      }
    };
    traverse(parsedData);
    setExpandedMap(newMap);
    showToast('Expanded all nodes', 'info');
  }, [parsedData, showToast]);

  const handleCollapseAll = useCallback(() => {
    if (!parsedData) return;
    const newMap = {};
    const traverse = (obj, path = 'root') => {
      if (obj && typeof obj === 'object') {
        newMap[path] = false;
        Object.keys(obj).forEach(k => {
          const childPath = Array.isArray(obj) ? `${path}[${k}]` : `${path}.${k}`;
          traverse(obj[k], childPath);
        });
      }
    };
    traverse(parsedData);
    newMap['root'] = true;
    setExpandedMap(newMap);
    showToast('Collapsed all nodes', 'info');
  }, [parsedData, showToast]);

  const handleCopyPath = useCallback((path) => {
    navigator.clipboard.writeText(path);
    showToast(`Path copied: ${path}`, 'success');
  }, [showToast]);

  const handleCopyValue = useCallback((val) => {
    const text = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  }, [showToast]);

  // Statistics
  const treeStats = useMemo(() => {
    if (!parsedData) return null;
    let nodeCount = 0;
    let maxDepth = 0;

    const countNodes = (val, depth = 0) => {
      nodeCount++;
      if (depth > maxDepth) maxDepth = depth;
      if (val && typeof val === 'object') {
        Object.values(val).forEach(child => countNodes(child, depth + 1));
      }
    };

    countNodes(parsedData);
    return { nodeCount, maxDepth };
  }, [parsedData]);

  const toolbar = (
    <div className="json-tree-toolbar">
      <div className="json-tree-search-wrap">
        <Search size={12} className="json-tree-search-icon" />
        <input
          type="text"
          className="json-tree-search-input"
          placeholder="Filter keys or values..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        {searchFilter && (
          <button
            className="json-tree-search-clear"
            onClick={() => setSearchFilter('')}
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      <div className="dw-btn-group">
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={handleExpandAll}
          disabled={!parsedData}
          title="Expand all tree branches"
        >
          <ChevronsUpDown size={12} />
          <span>Expand All</span>
        </button>
        <button
          className="dw-btn dw-btn-secondary dw-btn-sm"
          onClick={handleCollapseAll}
          disabled={!parsedData}
          title="Collapse all tree branches"
        >
          <ChevronsDownUp size={12} />
          <span>Collapse</span>
        </button>
      </div>
    </div>
  );

  const statusLeft = (
    <div className="json-tree-status">
      {isLoading ? (
        <span className="status-loading">
          <Loader2 size={12} className="dw-spin" /> Parsing JSON...
        </span>
      ) : parseError ? (
        <span className="status-error">
          <AlertCircle size={12} /> {parseError}
        </span>
      ) : parsedData !== null ? (
        <span className="status-success">
          <CheckCircle size={12} /> Valid JSON Tree
        </span>
      ) : (
        <span className="status-idle">Waiting for JSON input</span>
      )}
    </div>
  );

  const statusRight = treeStats ? (
    <div className="json-tree-stats">
      <span><strong>{treeStats.nodeCount}</strong> nodes</span>
      <span>•</span>
      <span>depth <strong>{treeStats.maxDepth}</strong></span>
      <span>•</span>
      <span>{input.length} chars</span>
    </div>
  ) : (
    <span>{input.length} chars</span>
  );

  return (
    <ToolWorkspace
      toolId="json-tree"
      input={input}
      onInputChange={setInput}
      inputLabel="JSON Source"
      outputLabel="Interactive Tree Viewer"
      toolbar={toolbar}
      statusLeft={statusLeft}
      statusRight={statusRight}
      singlePanel={false}
      output={null}
      hideOutput={false}
    >
      <div className="json-tree-view-wrapper">
        {isLoading ? (
          <div className="json-tree-loading-overlay">
            <div className="json-tree-loader-spinner">
              <Loader2 size={28} className="dw-spin" />
            </div>
            <span className="json-tree-loader-text">Building interactive tree structure...</span>
          </div>
        ) : parseError ? (
          <div className="dw-empty">
            <div className="dw-empty-icon-box danger">
              <AlertCircle size={24} />
            </div>
            <div className="dw-empty-title">Syntax Error in JSON</div>
            <div className="dw-empty-desc">{parseError}</div>
          </div>
        ) : parsedData !== null ? (
          <div className="json-tree-container">
            <TreeNode
              value={parsedData}
              depth={0}
              path="root"
              searchFilter={searchFilter}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              onCopyPath={handleCopyPath}
              onCopyValue={handleCopyValue}
            />
          </div>
        ) : (
          <div className="dw-empty">
            <div className="dw-empty-icon-box">
              <FileCode2 size={24} />
            </div>
            <div className="dw-empty-title">No JSON Loaded</div>
            <div className="dw-empty-desc">Paste valid JSON in the left panel to inspect the interactive tree.</div>
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
};

export default JsonTreeViewer;
