import React from 'react';
import './ChatHeader.css';

export default function ChatHeader() {
  return (
    <header className="chat-header">
      <div className="header-left">
        {/* Mobile toggle button if needed in future */}
      </div>
      <div className="header-right">
        <div className="user-dropdown">
          <div className="user-avatar">
            <span className="avatar-emoji">🐹</span>
          </div>
          <span className="user-name">User</span>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>
    </header>
  );
}
