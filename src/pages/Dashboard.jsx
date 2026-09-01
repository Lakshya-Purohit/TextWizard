import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllTools, CATEGORIES, getToolById } from '../tools/toolRegistry';
import {
  Search, Star, Clock, Zap,
  ArrowRight, ShieldCheck, Cpu
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { history, favorites, isFavorite, toggleFavorite, setCommandPaletteOpen } = useApp();

  const allTools = useMemo(() => getAllTools(), []);

  const recentTools = useMemo(() => {
    return history
      .slice(0, 6)
      .map(h => getToolById(h.toolId))
      .filter(Boolean);
  }, [history]);

  const favoriteTools = useMemo(() => {
    return favorites.map(id => getToolById(id)).filter(Boolean);
  }, [favorites]);

  const categories = Object.values(CATEGORIES);

  return (
    <div className="dw-dashboard">
      <div className="dw-dashboard-inner">
        {/* Sleek Command Center Header */}
        <header className="dw-dash-header">
          <div className="dw-dash-header-left">
            <div className="dw-dash-badge">
              <ShieldCheck size={13} className="dw-dash-badge-icon" />
              <span>100% Client-Side • Zero Data Telemetry</span>
            </div>
            <h1 className="dw-dash-headline">Developer Toolkit</h1>
            <p className="dw-dash-subtitle">
              Instant utilities for format transformation, diff inspection, cryptographic hashes, and token decoding.
            </p>
          </div>

          <div className="dw-dash-header-right">
            <button
              className="dw-dash-search-trigger"
              onClick={() => setCommandPaletteOpen(true)}
              title="Open command palette (Ctrl + K)"
            >
              <Search size={15} className="dw-dash-search-icon" />
              <span className="dw-dash-search-text">Search all tools...</span>
              <div className="dw-dash-search-keys">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
              </div>
            </button>
          </div>
        </header>

        {/* Quick Access Strip */}
        <div className="dw-dash-quick-strip">
          <div className="dw-dash-stat-pill">
            <Cpu size={14} />
            <span><strong>{allTools.length}</strong> Utilities Available</span>
          </div>
          <div className="dw-dash-stat-pill">
            <Zap size={14} />
            <span>Local WebAssembly & JS Engines</span>
          </div>
        </div>

        {/* Recently Used */}
        {recentTools.length > 0 && (
          <section className="dw-dash-section">
            <div className="dw-dash-section-title">
              <div className="dw-dash-section-label">
                <Clock size={15} />
                <h2>Recently Used</h2>
              </div>
              <span className="dw-dash-section-meta">{recentTools.length} tools</span>
            </div>
            <div className="dw-dash-grid">
              {recentTools.map(tool => {
                const Icon = tool.icon;
                const cat = CATEGORIES[tool.category];
                return (
                  <div
                    key={tool.id}
                    className="dw-dash-card"
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <div className="dw-dash-card-icon" style={{ color: cat?.color, background: `${cat?.color}14` }}>
                      <Icon size={18} />
                    </div>
                    <div className="dw-dash-card-body">
                      <div className="dw-dash-card-name-row">
                        <span className="dw-dash-card-name">{tool.name}</span>
                        <span className="dw-dash-card-cat" style={{ color: cat?.color }}>{cat?.name}</span>
                      </div>
                      <p className="dw-dash-card-desc">{tool.description}</p>
                    </div>
                    <button
                      className="dw-dash-card-fav"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      title={isFavorite(tool.id) ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Star
                        size={13}
                        fill={isFavorite(tool.id) ? 'var(--accent-warning)' : 'none'}
                        color={isFavorite(tool.id) ? 'var(--accent-warning)' : 'currentColor'}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Favorites */}
        {favoriteTools.length > 0 && (
          <section className="dw-dash-section">
            <div className="dw-dash-section-title">
              <div className="dw-dash-section-label">
                <Star size={15} />
                <h2>Starred Tools</h2>
              </div>
              <span className="dw-dash-section-meta">{favoriteTools.length} tools</span>
            </div>
            <div className="dw-dash-grid">
              {favoriteTools.map(tool => {
                const Icon = tool.icon;
                const cat = CATEGORIES[tool.category];
                return (
                  <div
                    key={tool.id}
                    className="dw-dash-card"
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <div className="dw-dash-card-icon" style={{ color: cat?.color, background: `${cat?.color}14` }}>
                      <Icon size={18} />
                    </div>
                    <div className="dw-dash-card-body">
                      <div className="dw-dash-card-name-row">
                        <span className="dw-dash-card-name">{tool.name}</span>
                        <span className="dw-dash-card-cat" style={{ color: cat?.color }}>{cat?.name}</span>
                      </div>
                      <p className="dw-dash-card-desc">{tool.description}</p>
                    </div>
                    <button
                      className="dw-dash-card-fav"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                    >
                      <Star size={13} fill="var(--accent-warning)" color="var(--accent-warning)" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categorized Tool Suite */}
        <section className="dw-dash-section">
          <div className="dw-dash-section-title">
            <div className="dw-dash-section-label">
              <h2>All Tool Modules</h2>
            </div>
            <span className="dw-dash-section-meta">{allTools.length} total utilities</span>
          </div>

          <div className="dw-dash-categories-container">
            {categories.map(cat => {
              const catTools = allTools.filter(t => t.category === cat.id);
              if (catTools.length === 0) return null;
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="dw-dash-cat-group">
                  <div className="dw-dash-cat-header">
                    <div className="dw-dash-cat-tag" style={{ color: cat.color, borderColor: `${cat.color}30`, background: `${cat.color}10` }}>
                      <CatIcon size={14} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="dw-dash-cat-desc">{cat.description}</span>
                    <span className="dw-dash-cat-count">{catTools.length}</span>
                  </div>

                  <div className="dw-dash-grid">
                    {catTools.map(tool => {
                      const Icon = tool.icon;
                      return (
                        <div
                          key={tool.id}
                          className="dw-dash-card"
                          onClick={() => navigate(`/tool/${tool.id}`)}
                        >
                          <div className="dw-dash-card-icon" style={{ color: cat.color, background: `${cat.color}12` }}>
                            <Icon size={18} />
                          </div>
                          <div className="dw-dash-card-body">
                            <span className="dw-dash-card-name">{tool.name}</span>
                            <p className="dw-dash-card-desc">{tool.description}</p>
                          </div>
                          <div className="dw-dash-card-right-action">
                            <button
                              className="dw-dash-card-fav"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(tool.id);
                              }}
                              title={isFavorite(tool.id) ? 'Remove favorite' : 'Add favorite'}
                            >
                              <Star
                                size={13}
                                fill={isFavorite(tool.id) ? 'var(--accent-warning)' : 'none'}
                                color={isFavorite(tool.id) ? 'var(--accent-warning)' : 'currentColor'}
                              />
                            </button>
                            <ArrowRight size={13} className="dw-dash-card-arrow" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
