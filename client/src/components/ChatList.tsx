import React from 'react';
import { List, Typography } from 'antd';
import { MessageFilled, UserOutlined } from '@ant-design/icons';
import { useAppStore, Chat } from '../store/useAppStore';

const { Text, Paragraph } = Typography;

const ChatList: React.FC = () => {
  const { joinedChats, activeChat, setActiveChat } = useAppStore();

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  return (
    <div className="flex-1 overflow-y-auto w-full px-2 py-3 select-none">
      {joinedChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 px-4 text-center mt-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-vibe-muted mb-3">
            <MessageFilled style={{ fontSize: '20px' }} />
          </div>
          <Text className="text-white font-semibold text-sm tracking-wide">No chats joined yet</Text>
          <Paragraph className="text-vibe-muted text-xs mt-1 leading-relaxed">
            Search public channels using the bar above to join your first discussion room!
          </Paragraph>
        </div>
      ) : (
        <List
          dataSource={joinedChats}
          className="space-y-1"
          renderItem={(chat) => {
            const isActive = activeChat?.id === chat.id;
            return (
              <List.Item
                onClick={() => handleSelectChat(chat)}
                className={`cursor-pointer px-4 py-3 rounded-xl border-none transition-all duration-200 flex flex-col items-start gap-1 mx-1 ${
                  isActive
                    ? 'bg-[#1E1E1E] text-white shadow-md border-l-4 border-vibe-primary'
                    : 'hover:bg-white/5 text-[#E6ECEB]'
                }`}
                style={{ padding: '12px 16px', display: 'flex' }}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={`font-semibold text-sm flex items-center gap-2 ${isActive ? 'text-[#B8DBD9]' : 'text-white'}`}>
                    <MessageFilled className={isActive ? 'text-vibe-primary' : 'text-vibe-muted'} style={{ fontSize: '14px' }} />
                    {chat.name}
                  </span>
                  
                  <span className="flex items-center gap-0.5 text-xs text-vibe-muted font-medium">
                    <UserOutlined style={{ fontSize: '10px' }} />
                    {chat.memberCount}
                  </span>
                </div>
                {chat.description && (
                  <Paragraph
                    ellipsis={{ rows: 1 }}
                    className={`text-xs m-0 w-full text-left leading-normal ${
                      isActive ? 'text-[#B8DBD9]/70' : 'text-vibe-muted'
                    }`}
                  >
                    {chat.description}
                  </Paragraph>
                )}
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default ChatList;
