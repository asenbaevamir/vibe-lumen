import React from 'react';
import { Avatar, Typography } from 'antd';

const { Text } = Typography;

interface UserBadgeProps {
  displayName: string;
  handle: string;
  avatarUrl: string;
  size?: number | 'large' | 'small' | 'default';
  textColor?: 'light' | 'dark';
}

const UserBadge: React.FC<UserBadgeProps> = ({
  displayName,
  handle,
  avatarUrl,
  size = 'default',
  textColor = 'light',
}) => {
  return (
    <div className="flex items-center gap-3 overflow-hidden select-none">
      <Avatar
        src={avatarUrl}
        size={size}
        className="flex-shrink-0 border-2 border-vibe-accent/20 shadow-md transition-transform hover:scale-105 duration-200"
      />
      <div className="flex flex-col min-w-0">
        <Text
          ellipsis
          className={`font-semibold text-sm leading-tight tracking-wide ${
            textColor === 'light' ? 'text-white' : 'text-vibe-dark'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {displayName}
        </Text>
        <Text
          ellipsis
          className={`text-xs mt-0.5 ${
            textColor === 'light' ? 'text-[#B8DBD9]' : 'text-vibe-muted'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {handle}
        </Text>
      </div>
    </div>
  );
};

export default UserBadge;
