import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import CounselorDashboard from './CounselorDashboard';
import './App.css';

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isAdmin = window.location.pathname === '/admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Friend',
            photoURL: user.photoURL,
          });
        } catch (err) {
          console.error("Error acquiring Firebase ID token:", err);
          setAuthToken(null);
          setCurrentUser(null);
        }
      } else {
        setAuthToken(null);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthToken(null);
      setCurrentUser(null);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  if (isAdmin) {
    return <CounselorDashboard />;
  }

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0d14',
        color: '#94a3b8',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌱</div>
          <p style={{ letterSpacing: '0.05em' }}>Loading Novara...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
      <Route path="/onboarding" element={
        <Onboarding authToken={authToken} currentUser={currentUser} />
      } />
      <Route path="/dashboard" element={
        <Dashboard authToken={authToken} currentUser={currentUser} onLogout={handleLogout} />
      } />
      <Route path="/chat" element={
        <ChatPage authToken={authToken} currentUser={currentUser} onLogout={handleLogout} />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
