import { create } from 'zustand';
import { Socket } from 'socket.io-client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  createdAt?: string;
}

export interface Chat {
  id: string;
  name: string;
  description: string;
  createdById: string;
  createdAt: string;
  memberCount: number;
  isMember?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string;
  };
}

interface AppStore {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthLoading: boolean;
  setIsAuthLoading: (loading: boolean) => void;
  authChecked: boolean;
  setAuthChecked: (checked: boolean) => void;
  logout: () => void;

  // Chats state
  joinedChats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  setJoinedChats: (chats: Chat[]) => void;
  addJoinedChat: (chat: Chat) => void;
  removeJoinedChat: (chatId: string) => void;

  // Messages state (Record<chatId, Message[]>)
  messages: Record<string, Message[]>;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;

  // Socket state
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Auth defaults
  user: null,
  isAuthLoading: true,
  authChecked: false,
  setUser: (user) => set({ user }),
  setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setAuthChecked: (checked) => set({ authChecked: checked }),
  logout: () => {
    // Access state to safely disconnect socket on logout
    set((state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      return {
        user: null,
        joinedChats: [],
        activeChat: null,
        messages: {},
        socket: null,
      };
    });
  },

  // Chats defaults
  joinedChats: [],
  activeChat: null,
  setActiveChat: (chat) => set({ activeChat: chat }),
  setJoinedChats: (chats) => set({ joinedChats: chats }),
  addJoinedChat: (chat) =>
    set((state) => {
      const exists = state.joinedChats.some((c) => c.id === chat.id);
      if (exists) return {};
      return { joinedChats: [chat, ...state.joinedChats] };
    }),
  removeJoinedChat: (chatId) =>
    set((state) => ({
      joinedChats: state.joinedChats.filter((c) => c.id !== chatId),
      activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
    })),

  // Messages defaults
  messages: {},
  addMessage: (chatId, message) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      // Prevent duplicate messages in list
      if (chatMessages.some((m) => m.id === message.id)) return {};
      return {
        messages: {
          ...state.messages,
          [chatId]: [...chatMessages, message],
        },
      };
    }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  // Socket defaults
  socket: null,
  setSocket: (socket) => set({ socket }),
}));
