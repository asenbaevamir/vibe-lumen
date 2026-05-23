import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<any>(null);

  // Keep input focused when active chat changes
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    
    // Re-focus the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter adds newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-black/5 flex items-center gap-3 relative select-none">
      <TextArea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={disabled}
        className="flex-1 resize-none border-none py-2 px-3 bg-[#F4F4F9] text-vibe-dark hover:bg-[#EAF0EF] focus:bg-[#EAF0EF] transition-colors focus:shadow-none duration-150"
        style={{
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '20px',
        }}
      />
      <Button
        type="primary"
        shape="circle"
        icon={<SendOutlined style={{ fontSize: '15px' }} />}
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className={`flex-shrink-0 flex items-center justify-center border-none shadow-md transition-all duration-200 ${
          text.trim() && !disabled
            ? 'scale-100 hover:scale-105 active:scale-95 bg-vibe-primary'
            : 'scale-95 opacity-50 bg-[#586F7C]'
        }`}
        style={{
          width: '42px',
          height: '42px',
          backgroundColor: text.trim() && !disabled ? '#04724D' : '#586F7C',
        }}
      />
    </div>
  );
};

export default MessageInput;
