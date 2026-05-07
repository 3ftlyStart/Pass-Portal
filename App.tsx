
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import WritingModule from './views/WritingModule';
import SpeakingModule from './views/SpeakingModule';
import ReadingModule from './views/ReadingModule';
import Login from './views/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AuthGate: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthGate />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/writing" element={<WritingModule />} />
                <Route path="/speaking" element={<SpeakingModule />} />
                <Route path="/reading" element={<ReadingModule />} />
                {/* Fallbacks */}
                <Route path="/listening" element={<div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">Listening module coming soon...</div>} />
                <Route path="/mock-tests" element={<div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">Full Mock Test engine coming soon...</div>} />
                <Route path="/history" element={<div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">Your practice history will appear here.</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
