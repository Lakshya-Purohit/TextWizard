import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getToolById, CATEGORIES } from '../tools/toolRegistry';
import { Sun, Moon, Monitor, Command, Zap } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
  const { theme, setTheme, setCommandPaletteOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const currentToolId = location.pathname.replace('/tool/', '');
  const currentTool = getToolById(currentToolId);
  const currentCategory = currentTool ? CATEGORIES[currentTool.category] : null;

  const themeOptions = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  const nextTheme = () => {
    const order = ['dark', 'light', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const CurrentThemeIcon = themeOptions.find(t => t.value === theme)?.icon || Moon;
  const themeLabel = themeOptions.find(t => t.value === theme)?.label || 'Dark';

  return (
    <header className="dw-topbar">
      <div className="dw-topbar-left">
        <button className="dw-topbar-brand" onClick={() => navigate('/')}>
          <Zap size={18} className="dw-topbar-logo" />
          <span className="dw-topbar-title">DevWizard</span>
        </button>

        {currentTool && (
          <div className="dw-topbar-breadcrumb">
            <span className="dw-topbar-separator">/</span>
            {currentCategory && (
              <>
                <span
                  className="dw-topbar-crumb"
                  style={{ color: currentCategory.color }}
                >
                  {currentCategory.name}
                </span>
                <span className="dw-topbar-separator">/</span>
              </>
            )}
            <span className="dw-topbar-crumb active">{currentTool.name}</span>
          </div>
        )}
      </div>

      <div className="dw-topbar-center">
        <button
          className="dw-topbar-search"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Command size={14} />
          <span>Search tools...</span>
          <div className="dw-topbar-search-kbd">
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
          </div>
        </button>
      </div>

      <div className="dw-topbar-right">
        <button
          className="dw-topbar-theme-btn"
          onClick={nextTheme}
          title={`Theme: ${themeLabel}`}
        >
          <CurrentThemeIcon size={16} />
          <span>{themeLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
