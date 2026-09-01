import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllTools, CATEGORIES, getToolById } from '../tools/toolRegistry';
import {
  Search, Star, Clock, Zap, Command,
  ArrowRight, Sparkles,
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { history, favorites, isFavorite, toggleFavorite, setCommandPaletteOpen } = useApp();

  const allTools = useMemo(() => getAllTools(), []);

  const recentTools = useMemo(() => {
    return history
      .slice(0, 8)
      .map(h => getToolById(h.toolId))
      .filter(Boolean);
  }, [history]);

  const favoriteTools = useMemo(() => {
    return favorites.map(id => getToolById(id)).filter(Boolean);
  }, [favorites]);

  const categories = Object.values(CATEGORIES);

  return (
    <div className="dw-dashboard">
      {/* Hero */}
      <div className="dw-dashboard-hero">
        <div className="dw-dashboard-hero-content">
          <div className="dw-dashboard-hero-icon">
            <Zap size={32} />
          </div>
          <h1 className="dw-dashboard-title">DevWizard</h1>
          <p className="dw-dashboard-tagline">One Workspace. Every Developer Utility.</p>

          <button
            className="dw-dashboard-search"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search size={16} />
            <span>Search tools...</span>
            <div className="dw-dashboard-search-kbd">
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dw-dashboard-content">
        {/* Recently Used */}
        {recentTools.length > 0 && (
          <section className="dw-dashboard-section">
            <div className="dw-dashboard-section-header">
              <Clock size={16} />
              <h2>Recently Used</h2>
            </div>
            <div className="dw-dashboard-grid">
              {recentTools.map(tool => {
                const Icon = tool.icon;
                const cat = CATEGORIES[tool.category];
                return (
                  <button
                    key={tool.id}
                    className="dw-dashboard-tool-card"
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <div className="dw-dashboard-tool-icon" style={{ color: cat?.color, background: cat?.color + '15' }}>
                      <Icon size={20} />
                    </div>
                    <div className="dw-dashboard-tool-info">
                      <span className="dw-dashboard-tool-name">{tool.name}</span>
                      <span className="dw-dashboard-tool-desc">{tool.description}</span>
                    </div>
                    <ArrowRight size={14} className="dw-dashboard-tool-arrow" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Favorites */}
        {favoriteTools.length > 0 && (
          <section className="dw-dashboard-section">
            <div className="dw-dashboard-section-header">
              <Star size={16} />
              <h2>Favorites</h2>
            </div>
            <div className="dw-dashboard-grid">
              {favoriteTools.map(tool => {
                const Icon = tool.icon;
                const cat = CATEGORIES[tool.category];
                return (
                  <button
                    key={tool.id}
                    className="dw-dashboard-tool-card"
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <div className="dw-dashboard-tool-icon" style={{ color: cat?.color, background: cat?.color + '15' }}>
                      <Icon size={20} />
                    </div>
                    <div className="dw-dashboard-tool-info">
                      <span className="dw-dashboard-tool-name">{tool.name}</span>
                      <span className="dw-dashboard-tool-desc">{tool.description}</span>
                    </div>
                    <ArrowRight size={14} className="dw-dashboard-tool-arrow" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* All Tools by Category */}
        <section className="dw-dashboard-section">
          <div className="dw-dashboard-section-header">
            <Sparkles size={16} />
            <h2>All Tools</h2>
            <span className="dw-dashboard-count">{allTools.length} tools</span>
          </div>

          {categories.map(cat => {
            const catTools = allTools.filter(t => t.category === cat.id);
            const CatIcon = cat.icon;
            return (
              <div key={cat.id} className="dw-dashboard-category">
                <div className="dw-dashboard-category-header">
                  <div className="dw-cat-indicator" style={{ background: cat.color }} />
                  <CatIcon size={16} style={{ color: cat.color }} />
                  <h3>{cat.name}</h3>
                  <span className="dw-dashboard-count">{catTools.length}</span>
                </div>
                <div className="dw-dashboard-grid">
                  {catTools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        className="dw-dashboard-tool-card"
                        onClick={() => navigate(`/tool/${tool.id}`)}
                      >
                        <div className="dw-dashboard-tool-icon" style={{ color: cat.color, background: cat.color + '15' }}>
                          <Icon size={20} />
                        </div>
                        <div className="dw-dashboard-tool-info">
                          <span className="dw-dashboard-tool-name">{tool.name}</span>
                          <span className="dw-dashboard-tool-desc">{tool.description}</span>
                        </div>
                        <div className="dw-dashboard-tool-actions">
                          <button
                            className="dw-dashboard-fav-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tool.id);
                            }}
                            title={isFavorite(tool.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              size={14}
                              fill={isFavorite(tool.id) ? 'var(--accent-warning)' : 'none'}
                              color={isFavorite(tool.id) ? 'var(--accent-warning)' : 'var(--text-tertiary)'}
                            />
                          </button>
                          <ArrowRight size={14} className="dw-dashboard-tool-arrow" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Keyboard Shortcuts */}
        <section className="dw-dashboard-section">
          <div className="dw-dashboard-section-header">
            <Command size={16} />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <div className="dw-dashboard-shortcuts">
            <div className="dw-shortcut">
              <span>Open Command Palette</span>
              <div><kbd>Ctrl</kbd> + <kbd>K</kbd></div>
            </div>
            <div className="dw-shortcut">
              <span>Toggle Theme</span>
              <div><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd></div>
            </div>
            <div className="dw-shortcut">
              <span>Toggle Sidebar</span>
              <div><kbd>Ctrl</kbd> + <kbd>B</kbd></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
