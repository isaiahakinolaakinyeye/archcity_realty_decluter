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

    const token = authHeader.replace('Bearer ', '');
    const userId = token.split('-')[1]; // token-{userId}-{timestamp}

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
