import React, { useEffect, useRef, useState } from 'react';
import { Spin, Button, Typography, Modal, Divider } from 'antd';
import { MessageFilled, UserOutlined, LogoutOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppStore, Message } from '../store/useAppStore';
import API from '../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const { Title, Text } = Typography;

const ChatWindow: React.FC = () => {
  const { activeChat, messages, setMessages, socket, removeJoinedChat, setActiveChat } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages: Message[] = activeChat ? messages[activeChat.id] || [] : [];

  // Scroll to bottom helper
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  };

  // Fetch message history when activeChat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/chats/${activeChat.id}/messages`);
        setMessages(activeChat.id, response.data);
        scrollToBottom('auto');
      } catch (error) {
        console.error('Error fetching message history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Notify room entry via socket
    if (socket) {
      socket.emit('join_chat', activeChat.id);
    }

    // Leave room on cleanup when switching chats
    return () => {
      if (socket && activeChat) {
        socket.emit('leave_chat', activeChat.id);
      }
    };
  }, [activeChat, socket, setMessages]);

  // Scroll down on new incoming messages
  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [chatMessages.length]);

  const handleSendMessage = (text: string) => {
    if (!activeChat || !socket) return;
    socket.emit('send_message', {
      chatId: activeChat.id,
      text,
    });
  };

  const handleLeaveChat = () => {
    if (!activeChat) return;

    Modal.confirm({
      title: 'Leave Channel?',
      content: `Are you sure you want to leave ${activeChat.name}? You will not receive any more real-time notifications from this room.`,
      okText: 'Leave Channel',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      styles: {
        mask: {
          backdropFilter: 'blur(4px)'
        }
      },
      onOk: async () => {
        setLeaving(true);
        try {
          await API.delete(`/chats/${activeChat.id}/leave`);
          removeJoinedChat(activeChat.id);
          setActiveChat(null);
        } catch (error) {
          console.error('Error leaving chat:', error);
        } finally {
          setLeaving(false);
        }
      },
    });
  };

  if (!activeChat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-vibe-bg text-center px-6 select-none">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#B8DBD9]/20 text-[#586F7C] shadow-sm animate-pulse">
          <MessageFilled style={{ fontSize: '36px' }} />
        </div>
        <Title level={3} style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 700 }} className="text-vibe-dark">
          Select a chat room
        </Title>
        <Text style={{ color: '#586F7C' }} className="mt-2 block max-w-sm text-sm font-medium leading-relaxed">
          Choose a conversation channel from the sidebar list, or search public channels at the top to start messaging.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-vibe-bg relative overflow-hidden">
      {/* Active Chat Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-black/5 flex-shrink-0 select-none shadow-sm z-10">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base text-vibe-dark truncate flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <MessageFilled className="text-vibe-primary" style={{ fontSize: '15px' }} />
            {activeChat.name}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-vibe-muted font-medium mt-0.5 truncate">
            <UserOutlined />
            <span>{activeChat.memberCount} members</span>
            {activeChat.description && (
              <>
                <Divider type="vertical" className="border-vibe-muted/30" />
                <span className="truncate italic">{activeChat.description}</span>
              </>
            )}
          </div>
        </div>

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          loading={leaving}
          onClick={handleLeaveChat}
          className="rounded-xl flex items-center justify-center font-semibold text-xs hover:bg-red-50/50"
          style={{ height: '36px' }}
        >
          Leave Channel
        </Button>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F4F4F9]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spin size="large" />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
            <InfoCircleOutlined style={{ fontSize: '28px', color: '#586F7C' }} className="mb-2" />
            <Text className="text-vibe-muted font-medium text-sm">No messages yet</Text>
            <Text className="text-vibe-muted text-xs mt-1">Be the first to post a message in this channel!</Text>
          </div>
        ) : (
          <div className="flex flex-col">
            {chatMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Text Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={loading || leaving} />
    </div>
  );
};

export default ChatWindow;
