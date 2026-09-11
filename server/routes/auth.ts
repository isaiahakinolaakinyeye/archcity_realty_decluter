import { Router } from 'express';
import { db } from '../db/store.js';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.users.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token: `token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/auth/me
authRouter.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Support token formats:
    // 1) token-{userId}-{timestamp} where userId contains hyphens (e.g. user-admin-1)
    // 2) token_{userId}_{timestamp}
    // 3) direct userId
    let userId: string | undefined;
    if (token.startsWith('token_')) {
      const parts = token.split('_');
      userId = parts.length > 2 ? parts.slice(1, -1).join('_') : parts[1];
    } else if (token.startsWith('token-')) {
      const parts = token.split('-');
      // remove first ('token') and last (timestamp)
      userId = parts.length > 2 ? parts.slice(1, -1).join('-') : parts[1];
    } else {
      userId = token;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
