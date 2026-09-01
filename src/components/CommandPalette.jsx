import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllTools, CATEGORIES } from '../tools/toolRegistry';
import { Search, Star, Clock, ArrowRight } from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, history, favorites } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const allTools = useMemo(() => getAllTools(), []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Show recent + favorites + all
      const recentIds = history.slice(0, 5).map(h => h.toolId);
      const recentTools = recentIds
        .map(id => allTools.find(t => t.id === id))
        .filter(Boolean)
        .map(t => ({ ...t, section: 'Recent' }));

      const favTools = favorites
        .map(id => allTools.find(t => t.id === id))
        .filter(Boolean)
        .filter(t => !recentIds.includes(t.id))
        .map(t => ({ ...t, section: 'Favorites' }));

      const remaining = allTools
        .filter(t => !recentIds.includes(t.id) && !favorites.includes(t.id))
        .map(t => ({ ...t, section: 'All Tools' }));

      return [...recentTools, ...favTools, ...remaining];
    }

    return allTools
      .filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some(k => k.includes(q)) ||
        t.category.includes(q)
      )
      .map(t => ({ ...t, section: 'Results' }));
  }, [query, allTools, history, favorites]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  // Focus input when opening
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Scroll selected into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectTool(results[selectedIndex]);
      }
    }
  };

  const selectTool = (tool) => {
    navigate(`/tool/${tool.id}`);
    setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  let lastSection = '';

  return (
    <div className="dw-cp-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div className="dw-cp" onClick={(e) => e.stopPropagation()}>
        <div className="dw-cp-header">
          <Search size={16} className="dw-cp-search-icon" />
          <input
            ref={inputRef}
            className="dw-cp-input"
            placeholder="Search tools, actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="dw-cp-list" ref={listRef}>
          {results.length === 0 ? (
            <div className="dw-cp-empty">No tools found</div>
          ) : (
            results.map((tool, idx) => {
              const showSection = tool.section !== lastSection;
              lastSection = tool.section;
              const Icon = tool.icon;
              const category = CATEGORIES[tool.category];

              return (
                <React.Fragment key={tool.id}>
                  {showSection && (
                    <div className="dw-cp-section">{tool.section}</div>
                  )}
                  <button
                    className={`dw-cp-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="dw-cp-item-left">
                      <Icon size={16} style={{ color: category?.color }} />
                      <div className="dw-cp-item-info">
                        <span className="dw-cp-item-name">{tool.name}</span>
                        <span className="dw-cp-item-desc">{tool.description}</span>
                      </div>
                    </div>
                    <div className="dw-cp-item-right">
                      {favorites.includes(tool.id) && <Star size={12} className="dw-cp-fav" />}
                      <span
                        className="dw-cp-item-cat"
                        style={{ color: category?.color }}
                      >
                        {category?.name}
                      </span>
                      {idx === selectedIndex && <ArrowRight size={14} />}
                    </div>
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="dw-cp-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
