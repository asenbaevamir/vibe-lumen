import { Router, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { protect, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Initiate Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google Callback URL
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed', session: false }),
  (req: any, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(400).json({ message: 'User not authenticated' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'vibe_lumen_super_secret_jwt_key_12345!',
        { expiresIn: '30d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect back to frontend
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      
      // We pass the token in the URL so that the frontend can choose to store it in localStorage as a fallback.
      return res.redirect(`${clientUrl}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('Google Callback Redirect Error:', error);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=auth_failed`);
    }
  }
);

// Get current profile
router.get('/me', protect, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
