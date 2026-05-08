
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import WritingModule from './views/WritingModule';
import SpeakingModule from './views/SpeakingModule';
import ReadingModule from './views/ReadingModule';
import Login from './views/Login';
import Profile from './views/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="writing" element={<WritingModule />} />
        <Route path="speaking" element={<SpeakingModule />} />
        <Route path="reading" element={<ReadingModule />} />
        <Route path="profile" element={<Profile />} />
        {/* Fallbacks */}
        <Route path="listening" element={<div className="flex items-center justify-center h-full text-slate-400 font-medium">Listening module coming soon...</div>} />
        <Route path="mock-tests" element={<div className="flex items-center justify-center h-full text-slate-400 font-medium">Full Mock Test engine coming soon...</div>} />
        <Route path="history" element={<div className="flex items-center justify-center h-full text-slate-400 font-medium">Your practice history will appear here.</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
