import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllTools, CATEGORIES, getToolById } from '../tools/toolRegistry';
import SeoMeta from '../components/SeoMeta';
import {
  Search, Star, Clock, Zap,
  ArrowRight, ShieldCheck, Cpu, Code2, Lock, Sparkles
} from 'lucide-react';
import DeveloperFooter from '../components/DeveloperFooter';
import './Dashboard.css';

const DASHBOARD_FAQS = [
  {
    q: 'What is DevWizard?',
    a: 'DevWizard is a client-side developer utility suite built for software engineers, security analysts, and web developers. It provides instant, local browser-based tools for formatting JSON/XML, decoding JWTs, converting Base64 files, analyzing GSM 03.38 SMS payloads, testing RegEx, computing cryptographic hashes, and comparing side-by-side text diffs.'
  },
  {
    q: 'Does DevWizard upload any tokens, passwords, or files to a server?',
    a: 'No. Every calculation, transformation, encryption, and decode routine is executed 100% locally in your browser memory using JavaScript and the native Web Cryptography API. Zero data telemetry is gathered or transmitted.'
  },
  {
    q: 'Can I use DevWizard offline?',
    a: 'Yes. Once loaded, all core utilities execute entirely within your browser runtime without requiring backend network roundtrips.'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { history, favorites, isFavorite, toggleFavorite, setCommandPaletteOpen } = useApp();

  const allTools = useMemo(() => getAllTools().filter(t => !t.hidden), []);

  const recentTools = useMemo(() => {
    return history
      .slice(0, 6)
      .map(h => getToolById(h.toolId))
      .filter(t => t && !t.hidden);
  }, [history]);

  const favoriteTools = useMemo(() => {
    return favorites.map(id => getToolById(id)).filter(t => t && !t.hidden);
  }, [favorites]);

  const categories = Object.values(CATEGORIES);

  return (
    <div className="dw-dashboard">
      <SeoMeta />

      <div className="dw-dashboard-inner">
        {/* Royal Obsidian Command Center Hero Header */}
        <header className="dw-dash-header">
          <div className="dw-dash-header-left">
            <div className="dw-dash-badge">
              <ShieldCheck size={13} className="dw-dash-badge-icon" />
              <span>100% Client-Side Execution • Zero Server Telemetry</span>
            </div>
            <h1 className="dw-dash-headline">The Developer Utility Workspace</h1>
            <p className="dw-dash-subtitle">
              Instant, privacy-first tools for JSON formatting, JWT token analysis, data conversion, cryptographic ciphers, and side-by-side text diffing.
            </p>
          </div>

          <div className="dw-dash-header-right">
            <button
              className="dw-dash-search-trigger"
              onClick={() => setCommandPaletteOpen(true)}
              title="Open command palette (Ctrl + K)"
              aria-label="Search all developer tools"
            >
              <Search size={15} className="dw-dash-search-icon" />
              <span className="dw-dash-search-text">Search all utilities...</span>
              <div className="dw-dash-search-keys">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
              </div>
            </button>
          </div>
        </header>

        {/* Quick Access Statistics Strip */}
        <div className="dw-dash-quick-strip">
          <div className="dw-dash-stat-pill">
            <Cpu size={14} style={{ color: 'var(--accent-primary)' }} />
            <span><strong>{allTools.length}</strong> Utilities Available</span>
          </div>
          <div className="dw-dash-stat-pill">
            <Lock size={14} style={{ color: 'var(--accent-gold)' }} />
            <span>Web Cryptography API & PBKDF2</span>
          </div>
          <div className="dw-dash-stat-pill">
            <Zap size={14} style={{ color: 'var(--accent-info)' }} />
            <span>Sub-millisecond Latency</span>
          </div>
        </div>

        {/* Recently Used Modules */}
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
                      aria-label="Toggle favorite"
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

        {/* Starred Modules */}
        {favoriteTools.length > 0 && (
          <section className="dw-dash-section">
            <div className="dw-dash-section-title">
              <div className="dw-dash-section-label">
                <Star size={15} fill="var(--accent-warning)" color="var(--accent-warning)" />
                <h2>Starred Utilities</h2>
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
                      title="Remove favorite"
                      aria-label="Remove favorite"
                    >
                      <Star size={13} fill="var(--accent-warning)" color="var(--accent-warning)" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categorized Tool Modules */}
        <section className="dw-dash-section">
          <div className="dw-dash-section-title">
            <div className="dw-dash-section-label">
              <Code2 size={15} />
              <h2>All Developer Modules</h2>
            </div>
            <span className="dw-dash-section-meta">{allTools.length} tools</span>
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
                              aria-label="Toggle favorite"
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

        {/* AI & Developer Knowledge Strip (AEO) */}
        <section className="dw-dash-info-section">
          <div className="dw-dash-info-card">
            <h3 className="dw-dash-info-heading">Why Choose DevWizard?</h3>
            <div className="dw-dash-info-grid">
              <div className="dw-dash-feature-item">
                <ShieldCheck size={20} className="dw-dash-feature-icon" />
                <h4>100% Client-Side Privacy</h4>
                <p>Sensitive API keys, JWT bearer tokens, customer records, and passwords never leave your browser. Zero cloud processing or telemetry.</p>
              </div>
              <div className="dw-dash-feature-item">
                <Sparkles size={20} className="dw-dash-feature-icon" />
                <h4>Zero Configuration Required</h4>
                <p>No account logins, no captchas, no rate limits, and no subscriptions. Instant access via keyboard shortcuts (Cmd+K).</p>
              </div>
              <div className="dw-dash-feature-item">
                <Cpu size={20} className="dw-dash-feature-icon" />
                <h4>High-Performance Engines</h4>
                <p>Sub-millisecond transformations powered by modern JavaScript engines, native WebCrypto subtle digests, and fast parsers.</p>
              </div>
            </div>
          </div>

          <div className="dw-dash-faq-card">
            <h3 className="dw-dash-info-heading">Frequently Asked Questions</h3>
            <div className="dw-dash-faq-list">
              {DASHBOARD_FAQS.map((faq, idx) => (
                <article key={idx} className="dw-dash-faq-item">
                  <h4 className="dw-dash-faq-q">{faq.q}</h4>
                  <p className="dw-dash-faq-a">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Developer Footer */}
      <DeveloperFooter />
    </div>
  );
};

export default Dashboard;
