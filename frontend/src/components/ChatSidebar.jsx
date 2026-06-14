import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatSidebar.css';

export default function ChatSidebar({ activeTab = 'chat', setActiveTab }) {
  const navigate = useNavigate();
  const [wellnessOpen, setWellnessOpen] = useState(
    activeTab === 'self-care' || activeTab === 'music' || activeTab === 'sleep'
  );

  useEffect(() => {
    if (activeTab === 'self-care' || activeTab === 'music' || activeTab === 'sleep') {
      setWellnessOpen(true);
    }
  }, [activeTab]);

  return (
    <aside className="chat-sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <img src="/mascot-transparent.png" alt="Nova mascot" className="sidebar-mascot-logo" />
        <span className="sidebar-logo-text">Novara</span>
      </div>

      <nav className="sidebar-nav">

        {/* Home */}
        <button className="sidebar-nav-item" onClick={() => navigate('/dashboard')}>
          <span className="icon">🏠</span>
          <span>Home</span>
        </button>

        {/* Chat With Nova — standalone */}
        <button 
          className={`sidebar-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span className="icon">💬</span>
          <span>Chat With Nova</span>
        </button>

        {/* New Chat — indented box below */}
        <div className="sidebar-sub-section">
          <button className="sidebar-sub-item" onClick={() => setActiveTab('chat')}>
            <span className="icon">➕</span>
            <span>New Chat</span>
          </button>
        </div>

        {/* Self Tests */}
        <button 
          className={`sidebar-nav-item ${activeTab === 'self-tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('self-tests')}
        >
          <span className="icon">📝</span>
          <span>Self Tests</span>
        </button>

        {/* Book a Therapist */}
        <button 
          className={`sidebar-nav-item ${activeTab === 'counselor' ? 'active' : ''}`}
          onClick={() => setActiveTab('counselor')}
        >
          <span className="icon">🧑‍⚕️</span>
          <span>Talk to Counsellor</span>
        </button>

        {/* Wellness Corner dropdown */}
        <div className="sidebar-dropdown-group">
          <button
            className={`sidebar-nav-item wellness-btn ${wellnessOpen ? 'open' : ''}`}
            onClick={() => setWellnessOpen(!wellnessOpen)}
          >
            <span className="icon">🌿</span>
            <span>Wellness Corner</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {wellnessOpen && (
            <div className="sidebar-dropdown-list">
              <button 
                className={`sidebar-dropdown-item ${activeTab === 'self-care' ? 'active' : ''}`}
                onClick={() => setActiveTab('self-care')}
              >
                <span className="icon">❤️</span> Self Care
              </button>
              <button 
                className={`sidebar-dropdown-item ${activeTab === 'music' ? 'active' : ''}`}
                onClick={() => setActiveTab('music')}
              >
                <span className="icon">🎵</span> Music
              </button>
              <button 
                className={`sidebar-dropdown-item ${activeTab === 'sleep' ? 'active' : ''}`}
                onClick={() => setActiveTab('sleep')}
              >
                <span className="icon">💤</span> Unwind and Sleep
              </button>
            </div>
          )}
        </div>

        {/* Plan ur day — standalone */}
        <button 
          className={`sidebar-nav-item ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <span className="icon">📅</span>
          <span>Plan ur day</span>
        </button>

      </nav>

      <div className="sidebar-footer">
        <button className="sos-btn" onClick={() => window.open('tel:112')}>SOS Helpline</button>
      </div>
    </aside>
  );
}
