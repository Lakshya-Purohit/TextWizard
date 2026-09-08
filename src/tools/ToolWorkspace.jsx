import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getToolById } from './toolRegistry';
import SeoMeta from '../components/SeoMeta';
import CodeSnippetsPanel from '../components/CodeSnippetsPanel';
import {
  Copy, Download, Trash2, Maximize2, Minimize2,
  Star, Shield, ChevronRight, HelpCircle,
  Sparkles, Check
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
  customEmptyState = null,
  errorMessage = null,
  codeSnippetsPanel = null,
  snippetOptions = {},
  showCodeSnippets = true,
}) => {
  const { toggleFavorite, isFavorite, addHistory, showToast } = useApp();
  const [splitRatio, setSplitRatio] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobilePanelTab, setMobilePanelTab] = useState('input'); // 'input', 'output', 'both'
  const [copiedOutput, setCopiedOutput] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const tool = getToolById(toolId);
  const category = tool ? CATEGORIES[tool.category] : null;

  // Record tool usage on mount
  useEffect(() => {
    if (toolId) addHistory(toolId);
  }, [toolId, addHistory]);

  const handleCopy = useCallback(async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOutput(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [showToast]);

  const handleDownload = useCallback((text, filename) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${toolId || 'output'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  }, [toolId, showToast]);

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
    if (!container) return;
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

  return (
    <div className="dw-workspace" ref={containerRef}>
      <SeoMeta toolId={toolId} />

      {/* Main Workspace Toolbar */}
      <div className="dw-workspace-toolbar">
        <div className="dw-workspace-toolbar-left">
          {tool && (
            <div className="dw-workspace-tool-info">
              {category && (
                <div
                  className="dw-cat-indicator"
                  style={{ background: category.color }}
                  title={`Category: ${category.name}`}
                />
              )}
              <h1 className="dw-workspace-tool-name">{tool.name}</h1>
            </div>
          )}
          {toolbar}
        </div>

        <div className="dw-workspace-toolbar-right">
          <div className="privacy-badge">
            <Shield size={10} />
            <span>100% Client-Side</span>
          </div>

          {tool && (
            <button
              className={`dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm ${isFavorite(toolId) ? 'favorited' : ''}`}
              onClick={() => toggleFavorite(toolId)}
              title={isFavorite(toolId) ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star
                size={14}
                fill={isFavorite(toolId) ? 'var(--accent-warning)' : 'none'}
                color={isFavorite(toolId) ? 'var(--accent-warning)' : 'currentColor'}
              />
            </button>
          )}

          <button
            className="dw-btn dw-btn-ghost dw-btn-icon dw-btn-sm dw-hide-mobile"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Description Strip */}
      {tool && (
        <div className="dw-workspace-desc-strip">
          <p className="dw-workspace-desc-text">{tool.description}</p>
        </div>
      )}

      {/* Mobile Tab Switcher Strip when not singlePanel and output is active */}
      {!singlePanel && !hideOutput && (
        <div className="dw-workspace-mobile-tabs dw-show-mobile">
          <button
            className={`dw-mobile-tab-btn ${mobilePanelTab === 'input' ? 'active' : ''}`}
            onClick={() => setMobilePanelTab('input')}
          >
            {inputLabel || 'Input'}
          </button>
          <button
            className={`dw-mobile-tab-btn ${mobilePanelTab === 'output' ? 'active' : ''}`}
            onClick={() => setMobilePanelTab('output')}
          >
            {outputLabel || 'Output'}
          </button>
          <button
            className={`dw-mobile-tab-btn ${mobilePanelTab === 'both' ? 'active' : ''}`}
            onClick={() => setMobilePanelTab('both')}
          >
            Split (Both)
          </button>
        </div>
      )}

      {/* Content Area */}
      {singlePanel ? (
        <div className="dw-workspace-content single">
          {children}
        </div>
      ) : (
        <div className={`dw-workspace-content ${!hideOutput ? `mobile-tab-${mobilePanelTab}` : ''}`}>
          {/* Input Panel */}
          <div
            className={`dw-workspace-panel input-panel ${mobilePanelTab === 'output' && !hideOutput ? 'mobile-panel-hidden' : ''}`}
            style={{ width: hideOutput ? '100%' : `${splitRatio}%` }}
          >
            <div className="dw-panel-header">
              <div className="dw-panel-header-title">
                <ChevronRight size={13} />
                <span>{inputLabel}</span>
              </div>
              <div className="dw-panel-header-actions">
                {input && (
                  <button
                    className="dw-btn dw-btn-ghost dw-btn-sm"
                    onClick={handleClear}
                    title="Clear input"
                  >
                    <Trash2 size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
            <div className="dw-panel-body dw-workspace-editor">
              <textarea
                className="dw-workspace-textarea"
                value={input || ''}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder="Paste or type input data here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Resizer on Desktop */}
          {!hideOutput && (
            <div className="dw-resizer dw-hide-mobile" onMouseDown={handleMouseDown} />
          )}

            {/* Output Panel */}
          {!hideOutput && (
            <div
              className={`dw-workspace-panel output-panel ${mobilePanelTab === 'input' ? 'mobile-panel-hidden' : ''}`}
              style={{ width: `${100 - splitRatio}%` }}
            >
              <div className="dw-panel-header">
                <div className="dw-panel-header-title">
                  <ChevronRight size={13} />
                  <span>{outputLabel}</span>
                </div>
                <div className="dw-panel-header-actions">
                  {output && (
                    <button
                      type="button"
                      className="dw-btn dw-btn-ghost dw-btn-sm"
                      onClick={() => handleCopy(output)}
                      title="Copy output to clipboard"
                    >
                      {copiedOutput ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                  {showCodeSnippets !== false && (
                    codeSnippetsPanel || (
                      <CodeSnippetsPanel
                        toolId={toolId}
                        options={{ ...snippetOptions, input, output }}
                      />
                    )
                  )}
                  {output && (
                    <button
                      type="button"
                      className="dw-btn dw-btn-ghost dw-btn-sm"
                      onClick={() => handleDownload(output, `${toolId || 'output'}.txt`)}
                      title="Download output file"
                    >
                      <Download size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className="dw-panel-body dw-workspace-editor">
                {React.Children.toArray(children).length > 0 ? (
                  children
                ) : errorMessage ? (
                  <div className="dw-empty">
                    <div className="dw-empty-icon-box danger">
                      <HelpCircle size={24} />
                    </div>
                    <div className="dw-empty-title">Validation Error</div>
                    <div className="dw-empty-desc">{errorMessage}</div>
                  </div>
                ) : (output !== null && output !== undefined && output !== '') ? (
                  <textarea
                    className="dw-workspace-textarea"
                    value={output}
                    readOnly
                    placeholder="Output will appear here..."
                    spellCheck={false}
                  />
                ) : customEmptyState ? (
                  customEmptyState
                ) : (
                  <div className="dw-empty">
                    <div className="dw-empty-icon-box">
                      <Sparkles size={24} />
                    </div>
                    <div className="dw-empty-title">Output Ready</div>
                    <div className="dw-empty-desc">Processed result will automatically display here.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="dw-workspace-status">
        <div className="dw-workspace-status-left">{statusLeft}</div>
        <div className="dw-workspace-status-right">{statusRight}</div>
      </div>

    </div>
  );
};

export default ToolWorkspace;
