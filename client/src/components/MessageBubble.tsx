import React from 'react';
import { Avatar, Typography } from 'antd';
import { useAppStore, Message } from '../store/useAppStore';

const { Text } = Typography;

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAppStore();

  const isMe = message.senderId === user?.id;

  // Format timestamp (e.g. 10:24 AM)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex w-full mb-4 animate-fade-in ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[70%] items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar (Only show for other users) */}
        {!isMe && (
          <Avatar
            src={message.sender.avatarUrl}
            size="default"
            className="flex-shrink-0 border border-vibe-accent/30 shadow-sm"
          />
        )}

        <div className="flex flex-col">
          {/* Sender Header for other users */}
          {!isMe && (
            <div className="flex items-baseline gap-1.5 ml-1.5 mb-1">
              <span className="text-xs font-bold text-vibe-dark tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                {message.sender.displayName}
              </span>
              <span className="text-[10px] text-vibe-muted font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {message.sender.handle}
              </span>
            </div>
          )}

          {/* Chat Bubble card */}
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm leading-relaxed relative ${
              isMe
                ? 'bg-vibe-primary text-white rounded-br-none'
                : 'bg-white text-vibe-dark rounded-bl-none border border-black/5'
            }`}
            style={{
              wordBreak: 'break-word',
              borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
            }}
          >
            {/* Message Body */}
            <p className="text-sm m-0 font-medium tracking-wide leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {message.text}
            </p>

            {/* Timestamp alignment inside the bubble */}
            <div className={`text-[9px] mt-1.5 text-right font-medium leading-none ${isMe ? 'text-[#B8DBD9]' : 'text-vibe-muted'}`}>
              {formatTime(message.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
