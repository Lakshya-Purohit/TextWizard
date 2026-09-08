import React from 'react';
import { X, Keyboard } from 'lucide-react';
import './ShortcutsModal.css';

const SHORTCUTS = [
  {
    category: 'Global Navigation',
    items: [
      { keys: ['Ctrl', 'K'], label: 'Open Command Palette & search all tools' },
      { keys: ['?'], label: 'Open this Keyboard Shortcuts cheat sheet' },
      { keys: ['Esc'], label: 'Close active modal / command palette' },
    ]
  },
  {
    category: 'Command Palette',
    items: [
      { keys: ['↑', '↓'], label: 'Navigate search results' },
      { keys: ['Enter'], label: 'Open selected tool' },
    ]
  },
  {
    category: 'Tool Workspaces',
    items: [
      { keys: ['Tab'], label: 'Focus next input or control' },
      { keys: ['Shift', 'Tab'], label: 'Focus previous input or control' },
      { keys: ['Ctrl', 'C'], label: 'Copy selected text or output' },
    ]
  }
];

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dw-shortcuts-overlay" onClick={onClose}>
      <div className="dw-shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="dw-shortcuts-header">
          <div className="dw-shortcuts-title">
            <Keyboard size={18} className="dw-shortcuts-icon" />
            <h3>Keyboard Shortcuts</h3>
          </div>
          <button className="dw-shortcuts-close" onClick={onClose} aria-label="Close shortcuts modal">
            <X size={16} />
          </button>
        </div>

        <div className="dw-shortcuts-body">
          {SHORTCUTS.map(group => (
            <div key={group.category} className="dw-shortcuts-group">
              <h4 className="dw-shortcuts-group-title">{group.category}</h4>
              <div className="dw-shortcuts-list">
                {group.items.map((item, idx) => (
                  <div key={idx} className="dw-shortcuts-row">
                    <span className="dw-shortcuts-label">{item.label}</span>
                    <div className="dw-shortcuts-keys">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="dw-kbd">{k}</kbd>
                          {kIdx < item.keys.length - 1 && <span className="dw-kbd-plus">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="dw-shortcuts-footer">
          <span>Tip: Press <kbd className="dw-kbd-sm">?</kbd> anywhere in DevWizard to open this helper.</span>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
