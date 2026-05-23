import React, { useEffect } from 'react';
import { Button, Card, Typography } from 'antd';
import { GoogleOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { API_BASE_URL } from '../services/api';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppStore();

  useEffect(() => {
    // If user is already authenticated, redirect to chat immediately
    if (user) {
      navigate('/');
    }

    // Check for errors passed back from OAuth callback
    const error = searchParams.get('error');
    if (error) {
      console.error('Authentication error received:', error);
    }
  }, [user, navigate, searchParams]);

  const handleGoogleLogin = () => {
    // Redirect browser to server auth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-gradient-to-tr from-[#F4F4F9] via-[#E6ECEB] to-[#B8DBD9] px-4">
      {/* Dynamic Background Circles for Sleek Aesthetic */}
      <div className="absolute top-[10%] left-[15%] h-72 w-72 rounded-full bg-[#B8DBD9] opacity-30 blur-3xl" />
      <div className="absolute bottom-[10%] right-[15%] h-80 w-80 rounded-full bg-[#586F7C] opacity-15 blur-3xl" />

      <Card
        className="w-full max-w-[420px] border-none shadow-2xl glass-panel animate-fade-in"
        style={{ borderRadius: '24px', background: 'rgba(255, 255, 255, 0.75)' }}
      >
        <div className="flex flex-col items-center py-6 text-center">
          {/* Logo / App Name */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vibe-dark text-vibe-accent shadow-lg shadow-black/25 transition-transform hover:scale-105 duration-300">
            <MessageOutlined style={{ fontSize: '32px' }} />
          </div>
          
          <Title level={2} style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 800 }} className="text-vibe-dark tracking-tight">
            VibeLumen
          </Title>
          <Text style={{ color: '#586F7C' }} className="mt-2 font-medium tracking-wide">
            Next-gen Real-time Messaging
          </Text>

          <div className="my-8 w-full border-t border-[#B8DBD9]/40" />

          <div className="w-full space-y-4">
            <Title level={4} style={{ fontFamily: 'Inter, sans-serif', margin: 0, fontWeight: 600 }} className="text-vibe-dark">
              Welcome back
            </Title>
            <Text style={{ color: '#586F7C' }} className="block mb-6 text-sm">
              Connect and synchronize messages seamlessly.
            </Text>

            <Button
              type="primary"
              size="large"
              icon={<GoogleOutlined style={{ fontSize: '18px' }} />}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2 border-none font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] duration-200"
              style={{
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#04724D',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Continue with Google
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-1.5 text-xs text-vibe-muted">
            <span>Secured stateless authentication with JWT</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
