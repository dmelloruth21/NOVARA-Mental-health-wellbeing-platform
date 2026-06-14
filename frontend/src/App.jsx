import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import CounselorDashboard from './CounselorDashboard';
import './App.css';

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const isAdmin = window.location.pathname === '/admin';

  if (isAdmin) {
    return <CounselorDashboard />;
  }

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
      <Route path="/onboarding" element={
        <Onboarding authToken={authToken} />
      } />
      <Route path="/dashboard" element={
        <Dashboard authToken={authToken} />
      } />
      <Route path="/chat" element={
        <ChatPage authToken={authToken} />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
