import { Router, Response } from 'express';
import prisma from '../config/prisma';
import { protect, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Apply auth protection
router.use(protect as any);

// GET /chats/:chatId/messages - Retrieve message history for a specific chat
router.get('/:chatId/messages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string; // Message ID for scrolling pagination

    // 1. Verify that the user is a member of the chat
    const membership = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: req.user!.id,
          chatId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied. You must join this chat to view its messages.' });
    }

    // 2. Fetch anchor timestamp if 'before' query exists
    let cursorTime: Date | null = null;
    if (before) {
      const anchorMessage = await prisma.message.findUnique({
        where: { id: before }
      });
      if (anchorMessage) {
        cursorTime = anchorMessage.createdAt;
      }
    }

    // 3. Query messages
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        ...(cursorTime ? {
          createdAt: {
            lt: cursorTime
          }
        } : {})
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // 4. Reverse to chronological order (ascending) for frontend rendering
    return res.json(messages.reverse());
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    return res.status(500).json({ message: 'Server error retrieving messages' });
  }
});

export default router;
