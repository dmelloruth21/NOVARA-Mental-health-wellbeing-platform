import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-wrapper">
      {/* Animated background blobs */}
      <div className="welcome-blob welcome-blob--1" />
      <div className="welcome-blob welcome-blob--2" />
      <div className="welcome-blob welcome-blob--3" />

      {/* Main card */}
      <div className="welcome-card">
        {/* Wellness icon */}
        <div className="welcome-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="welcome-heading">
          Good to have you here
        </h1>

        {/* Description */}
        <p className="welcome-description">
          Nova is your personal mental wellness companion — a safe,
          judgment-free space to express yourself, track your feelings,
          and discover tools that help you thrive every day.
        </p>
        {/* CTA Button */}
        <button
          id="welcome-get-started-btn"
          className="welcome-cta"
          onClick={() => navigate('/onboarding')}
        >
          <span>
            Let's get started
            <span className="welcome-cta-arrow">→</span>
          </span>
        </button>

        {/* Footer */}
        <p className="welcome-footer">
          Your privacy matters — all conversations stay confidential.
        </p>
      </div>
    </div>
  );
}
