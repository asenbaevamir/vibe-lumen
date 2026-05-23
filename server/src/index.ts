import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Passport strategy configurations
import './config/passport';

// Import Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chats';
import messageRoutes from './routes/messages';

// Import Socket Setup
import { setupSocketIO } from './socket/socketHandler';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://vibe-lumen-gu082iijp-standoffak286-5615s-projects.vercel.app';

// 1. Enable CORS for credentials (cookies support)
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// 2. Parsers and Sessionless Passport Init
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 3. Mount Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 4. Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// 5. Start Server Listener
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🔥 VIBE-LUMEN SERVER IS UP AND RUNNING 🔥`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Client: ${CLIENT_URL}`);
  console.log(`=========================================`);
});
