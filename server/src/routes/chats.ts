import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { protect, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Apply auth protection to all chat routes
router.use(protect as any);

// GET /chats/my - Get all chats the current user has joined
router.get('/my', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const memberships = await prisma.chatMember.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    const chats = memberships.map(m => ({
      ...m.chat,
      memberCount: m.chat._count.members
    }));

    return res.json(chats);
  } catch (error) {
    console.error('Get Joined Chats Error:', error);
    return res.status(500).json({ message: 'Server error retrieving joined chats' });
  }
});

// GET /chats/search - Global search of chats by name
router.get('/search', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const chats = await prisma.chat.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: { members: true }
        }
      },
      take: 20
    });

    const results = chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      description: chat.description,
      memberCount: chat._count.members,
      createdAt: chat.createdAt
    }));

    return res.json(results);
  } catch (error) {
    console.error('Search Chats Error:', error);
    return res.status(500).json({ message: 'Server error searching chats' });
  }
});

// POST /chats - Create a new public chat
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const creatorId = req.user!.id;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Chat name is required' });
    }

    // Check if name is unique
    const existing = await prisma.chat.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(400).json({ message: 'A chat with this name already exists' });
    }

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        name: name.trim(),
        description: (description || '').trim(),
        createdById: creatorId,
      }
    });

    // Automatically join creator as a member
    await prisma.chatMember.create({
      data: {
        userId: creatorId,
        chatId: chat.id
      }
    });

    return res.status(201).json({
      ...chat,
      memberCount: 1
    });
  } catch (error) {
    console.error('Create Chat Error:', error);
    return res.status(500).json({ message: 'Server error creating chat' });
  }
});

// GET /chats/:chatId - Get detailed chat info including members list
router.get('/:chatId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                handle: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isMember = chat.members.some(m => m.userId === req.user!.id);

    return res.json({
      id: chat.id,
      name: chat.name,
      description: chat.description,
      createdById: chat.createdById,
      createdAt: chat.createdAt,
      memberCount: chat._count.members,
      isMember,
      members: chat.members.map(m => ({
        ...m.user,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    console.error('Get Chat Info Error:', error);
    return res.status(500).json({ message: 'Server error retrieving chat details' });
  }
});

// POST /chats/:chatId/join - Join a chat
router.post('/:chatId/join', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    // Check if chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if already a member
    const existing = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: { userId, chatId }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'You are already a member of this chat' });
    }

    // Join
    await prisma.chatMember.create({
      data: { userId, chatId }
    });

    return res.json({ success: true, message: 'Joined chat successfully' });
  } catch (error) {
    console.error('Join Chat Error:', error);
    return res.status(500).json({ message: 'Server error joining chat' });
  }
});

// DELETE /chats/:chatId/leave - Leave a chat
router.delete('/:chatId/leave', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.id;

    // Check if member
    const existing = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: { userId, chatId }
      }
    });

    if (!existing) {
      return res.status(400).json({ message: 'You are not a member of this chat' });
    }

    // Leave
    await prisma.chatMember.delete({
      where: {
        userId_chatId: { userId, chatId }
      }
    });

    return res.json({ success: true, message: 'Left chat successfully' });
  } catch (error) {
    console.error('Leave Chat Error:', error);
    return res.status(500).json({ message: 'Server error leaving chat' });
  }
});

export default router;
