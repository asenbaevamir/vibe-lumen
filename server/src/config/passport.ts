import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: process.env.CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || '';
        const googleId = profile.id;
        const displayName = profile.displayName || 'Google User';
        const avatarUrl = profile.photos?.[0]?.value || `https://api.dicebear.com/7.x/adventurer/svg?seed=${googleId}`;

        // Find existing user by googleId
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        // Or fallback to checking email to link account (if not already found)
        if (!user && email) {
          user = await prisma.user.findFirst({
            where: { email },
          });
          if (user) {
            // Update user with googleId
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId },
            });
          }
        }

        if (!user) {
          // Generate unique handle: @user_ + 6 random alphanumeric chars
          let handle = '';
          let isUnique = false;
          while (!isUnique) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let randomStr = '';
            for (let i = 0; i < 6; i++) {
              randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            handle = `@user_${randomStr}`;

            const existingUser = await prisma.user.findUnique({
              where: { handle },
            });
            if (!existingUser) {
              isUnique = true;
            }
          }

          user = await prisma.user.create({
            data: {
              googleId,
              email,
              displayName,
              handle,
              avatarUrl,
            },
          });
        } else {
          // Keep display name and avatar updated if needed, or just return existing
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              avatarUrl: user.avatarUrl || avatarUrl,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Serialize / deserialize empty handlers as we are using JWT tokens (stateless passport session)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});
