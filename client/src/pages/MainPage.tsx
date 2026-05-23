import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAppStore, Message } from '../store/useAppStore';
import API, { API_BASE_URL } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const MainPage: React.FC = () => {
  const { user, setSocket, setJoinedChats, addMessage } = useAppStore();
  const navigate = useNavigate();

  // 1. Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // 2. Setup Socket connection and load initial chat list
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token') || '';

    // Initialize Socket.io-client connection
    const newSocket: Socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(newSocket);

    // Fetch all chats the user belongs to
    const fetchJoinedChats = async () => {
      try {
        const response = await API.get('/chats/my');
        setJoinedChats(response.data);
      } catch (error) {
        console.error('Error fetching joined chats:', error);
      }
    };

    fetchJoinedChats();

    // 3. Socket event registrations
    newSocket.on('connect', () => {
      console.log('⚡ Connected to WebSockets server successfully!');
    });

    newSocket.on('new_message', (payload: { chatId: string; message: Message }) => {
      const { chatId, message } = payload;
      // Dynamically add message to store record
      addMessage(chatId, message);
    });

    // Cleanup socket connection on logout or app refresh
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user, setSocket, setJoinedChats, addMessage]);

  if (!user) {
    return null; // Return empty during auth redirection check
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vibe-bg">
      {/* Sidebar - left layout */}
      <Sidebar />

      {/* Main panel - right layout */}
      <div className="flex-1 h-full overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
};

export default MainPage;
