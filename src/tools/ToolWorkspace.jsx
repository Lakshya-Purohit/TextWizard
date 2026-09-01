import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getToolById } from './toolRegistry';
import {
  Copy, Download, Trash2, Maximize2, Minimize2,
  Star, Shield, ChevronRight,
} from 'lucide-react';
import './ToolWorkspace.css';

const ToolWorkspace = ({
  toolId,
  children,
  input,
  output,
  inputLabel = 'Input',
  outputLabel = 'Output',
  onInputChange,
  inputLanguage = 'text',
  outputLanguage = 'text',
  toolbar,
  statusLeft,
  statusRight,
  singlePanel = false,
  hideOutput = false,
}) => {
  const { toggleFavorite, isFavorite, addHistory, showToast } = useApp();
  const [splitRatio, setSplitRatio] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const tool = getToolById(toolId);
  const category = tool ? CATEGORIES[tool.category] : null;

  // Record tool usage on mount
  React.useEffect(() => {
    if (toolId) addHistory(toolId);
  }, [toolId, addHistory]);

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [showToast]);

  const handleDownload = useCallback((text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  }, [showToast]);

  const handleClear = useCallback(() => {
    if (onInputChange) onInputChange('');
  }, [onInputChange]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Resize handler
  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    const container = containerRef.current;
    const startX = e.clientX;
    const startRatio = splitRatio;

    const handleMouseMove = (e) => {
      if (!isDragging.current || !container) return;
      const rect = container.getBoundingClientRect();
      const delta = e.clientX - startX;
      const deltaPercent = (delta / rect.width) * 100;
      const newRatio = Math.max(20, Math.min(80, startRatio + deltaPercent));
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [splitRatio]);

  // If tool renders its own full UI
  if (singlePanel) {
    return (
      <div className="dw-workspace" ref={containerRef}>
        <div className="dw-workspace-toolbar">
          <div className="dw-workspace-toolbar-left">
            {tool && (
              <div className="dw-workspace-tool-info">
                {category && (
                  <div
                    className="dw-cat-indicator"
                    style={{ background: category.color }}
                  />
                )}
                <span className="dw-workspace-tool-name">{tool.name}</span>
              </div>
            )}
            {toolbar}
          </div>
          <div className="dw-workspace-toolbar-right">
            <div className="privacy-badge">
              <Shield size={10} />
              Local
            </div>
            {tool && (
              <button
                className={`dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm ${isFavorite(toolId) ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(toolId)}
                title={isFavorite(toolId) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star size={14} fill={isFavorite(toolId) ? 'var(--accent-warning)' : 'none'} color={isFavorite(toolId) ? 'var(--accent-warning)' : 'currentColor'} />
              </button>
            )}
            <button className="dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
        <div className="dw-workspace-content single">
          {children}
        </div>
        {(statusLeft || statusRight) && (
          <div className="dw-workspace-status">
            <div className="dw-workspace-status-left">{statusLeft}</div>
            <div className="dw-workspace-status-right">{statusRight}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dw-workspace" ref={containerRef}>
      {/* Toolbar */}
      <div className="dw-workspace-toolbar">
        <div className="dw-workspace-toolbar-left">
          {tool && (
            <div className="dw-workspace-tool-info">
              {category && (
                <div
                  className="dw-cat-indicator"
                  style={{ background: category.color }}
                />
              )}
              <span className="dw-workspace-tool-name">{tool.name}</span>
            </div>
          )}
          {toolbar}
        </div>
        <div className="dw-workspace-toolbar-right">
          <div className="privacy-badge">
            <Shield size={10} />
            Local
          </div>
          {tool && (
            <button
              className={`dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm ${isFavorite(toolId) ? 'favorited' : ''}`}
              onClick={() => toggleFavorite(toolId)}
              title={isFavorite(toolId) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={14} fill={isFavorite(toolId) ? 'var(--accent-warning)' : 'none'} color={isFavorite(toolId) ? 'var(--accent-warning)' : 'currentColor'} />
            </button>
          )}
          <button className="dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Split Panels */}
      <div className="dw-workspace-content">
        {/* Input Panel */}
        <div className="dw-workspace-panel" style={{ width: hideOutput ? '100%' : `${splitRatio}%` }}>
          <div className="dw-panel-header">
            <div className="dw-panel-header-title">
              <ChevronRight size={12} />
              {inputLabel}
            </div>
            <div className="dw-panel-header-actions">
              <button
                className="dw-btn dw-btn-ghost dw-btn-sm"
                onClick={handleClear}
                title="Clear"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="dw-panel-body dw-workspace-editor">
            <textarea
              className="dw-workspace-textarea"
              value={input || ''}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder="Paste your content here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Resizer */}
        {!hideOutput && (
          <div className="dw-resizer" onMouseDown={handleMouseDown} />
        )}

        {/* Output Panel */}
        {!hideOutput && (
          <div className="dw-workspace-panel" style={{ width: `${100 - splitRatio}%` }}>
            <div className="dw-panel-header">
              <div className="dw-panel-header-title">
                <ChevronRight size={12} />
                {outputLabel}
              </div>
              <div className="dw-panel-header-actions">
                {output && (
                  <>
                    <button
                      className="dw-btn dw-btn-ghost dw-btn-sm"
                      onClick={() => handleCopy(output)}
                      title="Copy"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                    <button
                      className="dw-btn dw-btn-ghost dw-btn-sm"
                      onClick={() => handleDownload(output, `${toolId || 'output'}.txt`)}
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="dw-panel-body dw-workspace-editor">
              <textarea
                className="dw-workspace-textarea"
                value={output || ''}
                readOnly
                placeholder="Output will appear here..."
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="dw-workspace-status">
        <div className="dw-workspace-status-left">{statusLeft}</div>
        <div className="dw-workspace-status-right">{statusRight}</div>
      </div>
    </div>
  );
};

export default ToolWorkspace;
