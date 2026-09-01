import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getToolsByCategory } from '../tools/toolRegistry';
import {
  ChevronDown, ChevronRight, Star, Search,
  PanelLeftClose, PanelLeftOpen, LayoutDashboard, X, Zap
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const {
    sidebarCollapsed,
    toggleSidebar,
    favorites,
    isFavorite,
    mobileSidebarOpen,
    closeMobileSidebar
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(CATEGORIES)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentToolId = location.pathname.replace('/tool/', '');

  const toggleCategory = (catId) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileSidebar();
  };

  const favoriteTools = useMemo(() => {
    const allTools = Object.values(CATEGORIES).flatMap(cat => getToolsByCategory(cat.id));
    return allTools.filter(t => favorites.includes(t.id));
  }, [favorites]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    const filtered = {};
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tools = getToolsByCategory(cat.id).filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.keywords.some(k => k.includes(q))
      );
      if (tools.length > 0) filtered[key] = cat;
    });
    return filtered;
  }, [searchQuery]);

  const getFilteredTools = (catId) => {
    const tools = getToolsByCategory(catId);
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();
    return tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.keywords.some(k => k.includes(q))
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="dw-sidebar-backdrop"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`dw-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="dw-sidebar-header">
          {/* Mobile brand header */}
          <div className="dw-sidebar-mobile-brand">
            <Zap size={16} className="dw-topbar-logo" />
            <span>DevWizard</span>
          </div>

          <div className="dw-sidebar-header-actions">
            {/* Desktop toggle */}
            <button
              className="dw-sidebar-toggle dw-hide-mobile"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Mobile close button */}
            <button
              className="dw-sidebar-toggle dw-show-mobile"
              onClick={closeMobileSidebar}
              title="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        {(!sidebarCollapsed || mobileSidebarOpen) && (
          <div className="dw-sidebar-search">
            <Search size={14} className="dw-sidebar-search-icon" />
            <input
              type="text"
              placeholder="Filter tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dw-sidebar-search-input"
            />
          </div>
        )}

        {/* Collapsed Icons Only mode on Desktop */}
        {sidebarCollapsed && !mobileSidebarOpen ? (
          <div className="dw-sidebar-collapsed-icons">
            <button
              className={`dw-sidebar-icon-btn ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavigate('/')}
              title="Dashboard"
            >
              <LayoutDashboard size={18} />
            </button>
            {Object.values(CATEGORIES).map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="dw-sidebar-icon-btn"
                  onClick={() => {
                    const tools = getToolsByCategory(cat.id);
                    if (tools.length > 0) handleNavigate(`/tool/${tools[0].id}`);
                  }}
                  title={cat.name}
                  style={{ '--cat-color': cat.color }}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        ) : (
          <nav className="dw-sidebar-nav">
            {/* Dashboard */}
            <button
              className={`dw-sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavigate('/')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            {/* Favorites */}
            {favoriteTools.length > 0 && !searchQuery && (
              <div className="dw-sidebar-section">
                <div className="dw-sidebar-section-header">
                  <Star size={12} />
                  <span>Favorites</span>
                </div>
                {favoriteTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      className={`dw-sidebar-item ${currentToolId === tool.id ? 'active' : ''}`}
                      onClick={() => handleNavigate(`/tool/${tool.id}`)}
                    >
                      <Icon size={14} style={{ color: CATEGORIES[tool.category]?.color }} />
                      <span>{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Categories */}
            {Object.values(filteredCategories).map(cat => {
              const tools = getFilteredTools(cat.id);
              if (tools.length === 0) return null;
              const isExpanded = expandedCategories.includes(cat.id) || !!searchQuery;
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="dw-sidebar-section">
                  <button
                    className="dw-sidebar-category"
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <div className="dw-sidebar-category-left">
                      <div className="dw-cat-indicator" style={{ background: cat.color }} />
                      <CatIcon size={14} style={{ color: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <div className="dw-sidebar-category-right">
                      <span className="dw-sidebar-count">{tools.length}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="dw-sidebar-tools">
                      {tools.map(tool => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            className={`dw-sidebar-item ${currentToolId === tool.id ? 'active' : ''}`}
                            onClick={() => handleNavigate(`/tool/${tool.id}`)}
                          >
                            <Icon size={14} style={{ color: CATEGORIES[tool.category]?.color }} />
                            <span>{tool.name}</span>
                            {isFavorite(tool.id) && <Star size={10} className="dw-sidebar-fav-star" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="dw-sidebar-footer">
          <div className="privacy-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Local-first processing
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
