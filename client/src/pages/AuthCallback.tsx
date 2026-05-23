import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/useAppStore';
import API from '../services/api';

const { Text } = Typography;

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAuthChecked, setIsAuthLoading } = useAppStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        console.error('No token found in OAuth redirection URL');
        setIsAuthLoading(false);
        setAuthChecked(true);
        navigate('/auth?error=no_token');
        return;
      }

      try {
        // Save token to localStorage
        localStorage.setItem('token', token);

        // Fetch User Info
        const response = await API.get('/auth/me');
        const user = response.data.user;

        if (user) {
          setUser(user);
        } else {
          throw new Error('User data is missing from auth profile response');
        }

        setIsAuthLoading(false);
        setAuthChecked(true);
        navigate('/');
      } catch (error) {
        console.error('Error during authentication callback handling:', error);
        localStorage.removeItem('token'); // Clear token if invalid
        setUser(null);
        setIsAuthLoading(false);
        setAuthChecked(true);
        navigate('/auth?error=token_invalid');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setAuthChecked, setIsAuthLoading]);

  const antIcon = <LoadingOutlined style={{ fontSize: 44, color: '#04724D' }} spin />;

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center bg-vibe-bg">
      <Spin indicator={antIcon} />
      <Text className="mt-4 font-semibold text-vibe-muted animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
        Finalizing your secure session...
      </Text>
    </div>
  );
};

export default AuthCallback;
