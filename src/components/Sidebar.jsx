import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getToolsByCategory } from '../tools/toolRegistry';
import {
  ChevronDown, Star, Search,
  PanelLeftClose, PanelLeftOpen, LayoutDashboard, X, Zap,
  ShieldCheck
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
    return allTools.filter(t => !t.hidden && favorites.includes(t.id));
  }, [favorites]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    const filtered = {};
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const tools = getToolsByCategory(cat.id).filter(t =>
        !t.hidden && (
          t.name.toLowerCase().includes(q) ||
          t.keywords.some(k => k.includes(q))
        )
      );
      if (tools.length > 0) filtered[key] = cat;
    });
    return filtered;
  }, [searchQuery]);

  const getFilteredTools = (catId) => {
    const tools = getToolsByCategory(catId).filter(t => !t.hidden);
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
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`dw-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="dw-sidebar-header">
          {/* Mobile brand header */}
          <div className="dw-sidebar-mobile-brand" onClick={() => handleNavigate('/')}>
            <Zap size={18} className="dw-topbar-logo" />
            <span>DevWizard</span>
          </div>

          <div className="dw-sidebar-header-actions">
            {/* Desktop toggle */}
            <button
              className="dw-sidebar-toggle dw-hide-mobile"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>

            {/* Mobile close button */}
            <button
              className="dw-sidebar-toggle dw-show-mobile"
              onClick={closeMobileSidebar}
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Input in Sidebar */}
        {(!sidebarCollapsed || mobileSidebarOpen) && (
          <div className="dw-sidebar-search">
            <Search size={13} className="dw-sidebar-search-icon" />
            <input
              type="text"
              placeholder="Filter utilities..."
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
                    const tools = getToolsByCategory(cat.id).filter(t => !t.hidden);
                    if (tools.length > 0) handleNavigate(`/tool/${tools[0].id}`);
                  }}
                  title={cat.name}
                  style={{ color: 'var(--accent-gold)' }}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        ) : (
          <nav className="dw-sidebar-nav">
            {/* Dashboard Link */}
            <button
              className={`dw-sidebar-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavigate('/')}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            {/* Starred / Favorites */}
            {favoriteTools.length > 0 && !searchQuery && (
              <div className="dw-sidebar-section">
                <div className="dw-sidebar-section-header">
                  <Star size={11} fill="var(--accent-warning)" color="var(--accent-warning)" />
                  <span>Starred</span>
                </div>
                {favoriteTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      className={`dw-sidebar-item ${currentToolId === tool.id ? 'active' : ''}`}
                      onClick={() => handleNavigate(`/tool/${tool.id}`)}
                    >
                      <Icon size={14} className="dw-sidebar-tool-icon" />
                      <span>{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Categorized Tools */}
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
                      <CatIcon size={14} className="dw-sidebar-cat-icon" />
                      <span>{cat.name}</span>
                    </div>
                    <div className="dw-sidebar-category-right">
                      <span className="dw-sidebar-count">{tools.length}</span>
                      <ChevronDown
                        size={13}
                        className={`dw-sidebar-cat-chevron ${isExpanded ? 'open' : ''}`}
                      />
                    </div>
                  </button>
                  <div className={`dw-sidebar-tools ${isExpanded ? 'expanded' : ''}`}>
                    {tools.map(tool => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          className={`dw-sidebar-item ${currentToolId === tool.id ? 'active' : ''}`}
                          onClick={() => handleNavigate(`/tool/${tool.id}`)}
                        >
                          <Icon size={14} className="dw-sidebar-tool-icon" />
                          <span>{tool.name}</span>
                          {isFavorite(tool.id) && <Star size={10} className="dw-sidebar-fav-star" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        )}

        <div className="dw-sidebar-footer">
          <div className="privacy-badge">
            <ShieldCheck size={11} />
            <span>100% Client-Side</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
