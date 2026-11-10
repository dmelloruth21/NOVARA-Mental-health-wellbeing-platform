import React, { useState } from 'react';
import './ChatHeader.css';

export default function ChatHeader({ currentUser, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="chat-header">
      <div className="header-left">
        {/* Mobile toggle button if needed in future */}
      </div>
      <div className="header-right">
        <div
          className="user-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div className="user-avatar">
            <span className="avatar-emoji">🐹</span>
          </div>
          <span className="user-name">{currentUser?.displayName || 'User'}</span>
          <span className="dropdown-icon">▼</span>

          {dropdownOpen && onLogout && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '8px 12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                minWidth: '130px',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                  setDropdownOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 4px',
                  textAlign: 'left',
                }}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
