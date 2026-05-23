import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppStore } from './store/useAppStore';
import API from './services/api';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import MainPage from './pages/MainPage';

const { Text } = Typography;

const App: React.FC = () => {
  const { user, isAuthLoading, authChecked, setUser, setIsAuthLoading, setAuthChecked } = useAppStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthLoading(false);
        setAuthChecked(true);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        const userData = response.data.user;
        
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsAuthLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, [setUser, setIsAuthLoading, setAuthChecked]);

  // Premium loading screen for initial session boot
  if (isAuthLoading || !authChecked) {
    const loadingIcon = <LoadingOutlined style={{ fontSize: 40, color: '#04724D' }} spin />;
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-vibe-bg select-none">
        <Spin indicator={loadingIcon} />
        <Text className="mt-4 font-semibold text-vibe-muted animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
          Restoring secure chat connection...
        </Text>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public auth route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Secure callback route */}
        <Route path="/auth-callback" element={<AuthCallback />} />
        
        {/* Private workspace landing */}
        <Route
          path="/"
          element={user ? <MainPage /> : <Navigate to="/auth" replace />}
        />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
