import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export interface SocketUser {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
}

export const setupSocketIO = (io: Server) => {
  // Socket.io JWT Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // Fallback: Parse from handshake cookie headers
      if (!token && socket.handshake.headers.cookie) {
        const cookieStr = socket.handshake.headers.cookie;
        const match = cookieStr.match(/token=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication failed: Token missing'));
      }

      // Verify JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'vibe_lumen_super_secret_jwt_key_12345!'
      ) as { id: string };

      // Find User in DB
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        return next(new Error('Authentication failed: User not found'));
      }

      // Attach user object to socket instance data
      socket.data.user = user as SocketUser;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      return next(new Error('Authentication failed: Token invalid'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as SocketUser;
    console.log(`⚡ Socket connected: ${user.displayName} (${user.handle}) [ID: ${socket.id}]`);

    // Handle joining a chat room
    socket.on('join_chat', (chatId: string) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`👥 User ${user.handle} joined room: ${chatId}`);
      // Notify other room members (optional feature)
      socket.to(chatId).emit('user_joined', { chatId, user });
    });

    // Handle leaving a chat room
    socket.on('leave_chat', (chatId: string) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`🚶 User ${user.handle} left room: ${chatId}`);
      socket.to(chatId).emit('user_left', { chatId, user });
    });

    // Handle sending a text message
    socket.on('send_message', async ({ chatId, text }: { chatId: string; text: string }) => {
      if (!chatId || !text || !text.trim()) return;

      try {
        // Double-check user is still registered as a member
        const isMember = await prisma.chatMember.findUnique({
          where: {
            userId_chatId: {
              userId: user.id,
              chatId
            }
          }
        });

        if (!isMember) {
          socket.emit('error_message', { message: 'You must be a member of this chat to send messages' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: user.id,
            text: text.trim(),
          },
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                handle: true,
                avatarUrl: true
              }
            }
          }
        });

        // Broadcast the message back to all users inside the chat room (including sender)
        io.to(chatId).emit('new_message', {
          chatId,
          message
        });

        console.log(`✉️ Message in ${chatId} from ${user.handle}: "${text.trim().substring(0, 30)}..."`);
      } catch (error) {
        console.error('Socket send_message database error:', error);
        socket.emit('error_message', { message: 'Failed to send message: Server error' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.handle} [ID: ${socket.id}]`);
    });
  });
};
