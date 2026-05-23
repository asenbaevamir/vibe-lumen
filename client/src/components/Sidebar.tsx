import React, { useState } from 'react';
import { Button, Modal, Form, Input, Divider, Typography } from 'antd';
import { PlusOutlined, LogoutOutlined, MessageFilled, SettingOutlined } from '@ant-design/icons';
import { useAppStore, Chat } from '../store/useAppStore';
import API from '../services/api';
import ChatSearch from './ChatSearch';
import ChatList from './ChatList';
import UserBadge from './UserBadge';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const Sidebar: React.FC = () => {
  const { user, logout, addJoinedChat, setActiveChat } = useAppStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      console.error('Logout API failed, forcing local state clear:', e);
    } finally {
      // Clear local state
      localStorage.removeItem('token');
      logout();
      navigate('/auth');
    }
  };

  const handleCreateChat = async (values: { name: string; description: string }) => {
    setLoading(true);
    try {
      const response = await API.post('/chats', {
        name: values.name,
        description: values.description,
      });

      const newChat = response.data as Chat;

      // Add to Zustand joined chats & active chat list
      addJoinedChat(newChat);
      setActiveChat(newChat);

      // Close and clear form
      setCreateModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error creating chat channel:', error);
      Modal.error({
        title: 'Channel Creation Failed',
        content: error.response?.data?.message || 'A network error occurred. Please try again.',
        centered: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[280px] h-full flex flex-col bg-vibe-dark text-white border-r border-[#586F7C]/20 flex-shrink-0 select-none">
      
      {/* 1. Top Section - Global Chat Search */}
      <ChatSearch />

      {/* 2. Create Chat Channel Action Trigger */}
      <div className="px-4 py-2">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 font-semibold border-none hover:opacity-90 transition-opacity duration-150"
          style={{
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#04724D',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          New Channel
        </Button>
      </div>

      <Divider className="border-[#586F7C]/20 my-2 px-4" style={{ margin: '8px 0' }} />

      {/* 3. Middle Section - Active / Joined Chat Rooms List */}
      <ChatList />

      {/* 4. Bottom Section - Current Authenticated User Badge & Actions */}
      {user && (
        <div className="p-4 bg-[#0A0A0A] border-t border-[#586F7C]/20 flex items-center justify-between gap-2 flex-shrink-0">
          <UserBadge
            displayName={user.displayName}
            handle={user.handle}
            avatarUrl={user.avatarUrl}
            textColor="light"
            size="default"
          />

          <Button
            type="text"
            icon={<LogoutOutlined style={{ fontSize: '16px', color: '#586F7C' }} />}
            onClick={handleLogout}
            className="flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors duration-150 p-2"
            title="Log out session"
          />
        </div>
      )}

      {/* Create Chat Modal Form */}
      <Modal
        title={null}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        centered
        styles={{
          mask: {
            backdropFilter: 'blur(4px)',
            background: 'rgba(0,0,0,0.4)',
          },
          content: {
            borderRadius: '20px',
            backgroundColor: '#F4F4F9',
            padding: '24px',
          },
        }}
      >
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-vibe-dark text-vibe-accent shadow-md">
            <MessageFilled style={{ fontSize: '20px' }} />
          </div>
          <Typography.Title level={3} style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 700 }}>
            Create Channel
          </Typography.Title>
          <Text className="text-vibe-muted text-xs font-medium">
            Start a public channel where others can participate.
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleCreateChat}>
          <Form.Item
            name="name"
            label={<span className="font-semibold text-xs text-vibe-muted uppercase tracking-wider">Channel Name</span>}
            rules={[
              { required: true, message: 'Please enter a name for the channel' },
              { min: 3, message: 'Name must be at least 3 characters long' },
              { max: 30, message: 'Name must be less than 30 characters' },
            ]}
          >
            <Input
              placeholder="e.g. general-talks"
              style={{
                height: '42px',
                borderRadius: '10px',
                borderColor: '#B8DBD9',
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-semibold text-xs text-vibe-muted uppercase tracking-wider">Description (Optional)</span>}
            rules={[{ max: 150, message: 'Description must be less than 150 characters' }]}
          >
            <Input.TextArea
              placeholder="Provide a short synopsis..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{
                borderRadius: '10px',
                borderColor: '#B8DBD9',
              }}
            />
          </Form.Item>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setCreateModalOpen(false);
                form.resetFields();
              }}
              className="w-1/2 rounded-xl font-semibold border-none bg-white hover:bg-neutral-100 text-vibe-muted"
              style={{ height: '44px' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-1/2 rounded-xl font-semibold border-none flex items-center justify-center gap-1.5 shadow-md shadow-[#04724D]/20"
              style={{ height: '44px', backgroundColor: '#04724D' }}
            >
              Create
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Sidebar;
