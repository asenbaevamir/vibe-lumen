import React, { useState, useEffect, useRef } from 'react';
import { Input, List, Badge, Modal, Button, Spin, Typography } from 'antd';
import { SearchOutlined, UserOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import API from '../services/api';
import { useAppStore, Chat } from '../store/useAppStore';

const { Text, Paragraph } = Typography;

const ChatSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Join modal states
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joining, setJoining] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { setActiveChat, addJoinedChat, joinedChats } = useAppStore();

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when typing (debounced or on change)
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setShowDropdown(true);
      try {
        const response = await API.get(`/chats/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error('Error searching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = async (chat: Chat) => {
    // Hide search dropdown
    setShowDropdown(false);
    setQuery('');

    // Fetch full chat detail to check membership status
    setDetailLoading(true);
    try {
      const response = await API.get(`/chats/${chat.id}`);
      const chatDetails = response.data;
      
      setSelectedChat(chatDetails);

      if (chatDetails.isMember) {
        // If already a member, open it immediately
        setActiveChat({
          id: chatDetails.id,
          name: chatDetails.name,
          description: chatDetails.description,
          createdById: chatDetails.createdById,
          createdAt: chatDetails.createdAt,
          memberCount: chatDetails.memberCount,
        });
      } else {
        // Otherwise, show join prompt modal
        setJoinModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleJoinChat = async () => {
    if (!selectedChat) return;
    setJoining(true);
    try {
      await API.post(`/chats/${selectedChat.id}/join`);
      
      const newChat: Chat = {
        id: selectedChat.id,
        name: selectedChat.name,
        description: selectedChat.description,
        createdById: selectedChat.createdById,
        createdAt: selectedChat.createdAt,
        memberCount: selectedChat.memberCount + 1,
      };

      // Add to store
      addJoinedChat(newChat);
      setActiveChat(newChat);
      setJoinModalVisible(false);
    } catch (error) {
      console.error('Error joining chat:', error);
    } finally {
      setJoining(false);
      setSelectedChat(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full px-4 pt-4 pb-2 z-50">
      <Input
        placeholder="Search public channels..."
        prefix={<SearchOutlined className="text-vibe-muted mr-1" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShowDropdown(true)}
        className="w-full bg-[#1A1A1A] border-none text-white hover:bg-[#222222] focus:bg-[#222222] transition-colors duration-200"
        style={{
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
        }}
      />

      {/* Loading indicator for full detail fetch */}
      {detailLoading && (
        <div className="absolute right-6 top-6">
          <Spin size="small" />
        </div>
      )}

      {/* Results Dropdown Box */}
      {showDropdown && query.trim() && (
        <div className="absolute left-4 right-4 mt-2 max-h-72 overflow-y-auto rounded-xl bg-vibe-dark/95 border border-[#586F7C]/30 shadow-2xl backdrop-blur-xl animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Spin indicator={<SearchOutlined style={{ fontSize: 24, color: '#B8DBD9' }} spin />} />
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-vibe-muted text-sm font-medium">
              No channels match "{query}"
            </div>
          ) : (
            <List
              dataSource={results}
              renderItem={(chat) => {
                const alreadyMember = joinedChats.some((c) => c.id === chat.id);
                return (
                  <List.Item
                    onClick={() => handleResultClick(chat)}
                    className="cursor-pointer px-4 py-3 hover:bg-vibe-muted/20 border-b border-white/5 transition-colors duration-150 flex flex-col items-start gap-1"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                        <MessageOutlined className="text-vibe-accent" />
                        {chat.name}
                      </span>
                      {alreadyMember ? (
                        <Badge count="Joined" style={{ backgroundColor: '#04724D', fontSize: '10px' }} />
                      ) : (
                        <Badge count={`${chat.memberCount} members`} style={{ backgroundColor: '#586F7C', fontSize: '10px' }} />
                      )}
                    </div>
                    {chat.description && (
                      <Paragraph ellipsis={{ rows: 1 }} className="text-xs text-vibe-muted m-0 w-full text-left">
                        {chat.description}
                      </Paragraph>
                    )}
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      )}

      {/* Join Chat Modal */}
      <Modal
        title={null}
        open={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        footer={null}
        centered
        destroyOnClose
        className="glass-panel"
        styles={{
          mask: {
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.4)'
          },
          content: {
            borderRadius: '20px',
            backgroundColor: '#F4F4F9',
            padding: '24px'
          }
        }}
      >
        {selectedChat && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vibe-dark text-vibe-accent shadow-md">
              <MessageOutlined style={{ fontSize: '24px' }} />
            </div>

            <Typography.Title level={3} style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 700 }}>
              {selectedChat.name}
            </Typography.Title>
            
            <div className="mt-2 flex items-center justify-center gap-1.5 text-vibe-muted font-medium text-xs">
              <UserOutlined />
              <span>{selectedChat.memberCount} members</span>
            </div>

            <div className="my-5 rounded-xl bg-white/60 p-4 border border-[#B8DBD9]/30 text-left">
              <Text className="text-xs font-semibold text-vibe-muted uppercase tracking-wider block mb-1">
                About this Channel
              </Text>
              <Paragraph className="text-sm text-vibe-dark m-0 leading-relaxed">
                {selectedChat.description || 'No description provided for this public chat room.'}
              </Paragraph>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setJoinModalVisible(false)}
                className="w-1/2 rounded-xl font-semibold border-none bg-white hover:bg-neutral-100 text-vibe-muted"
                style={{ height: '44px' }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={joining}
                onClick={handleJoinChat}
                className="w-1/2 rounded-xl font-semibold border-none flex items-center justify-center gap-1.5 shadow-md shadow-[#04724D]/20"
                style={{ height: '44px', backgroundColor: '#04724D' }}
              >
                Join Channel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatSearch;
