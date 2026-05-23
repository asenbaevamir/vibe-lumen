import { Router, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

// GET /users/:handle - fetch user profile details by handle
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    
    // Ensure the query handle has the prefix
    const targetHandle = handle.startsWith('@') ? handle : `@${handle}`;

    const user = await prisma.user.findUnique({
      where: { handle: targetHandle },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

export default router;
