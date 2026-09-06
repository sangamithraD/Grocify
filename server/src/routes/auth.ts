import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import t from '../utils/i18n';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_grocify_app_2026';

// 1. User Registration (Signup)
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;

  if (!email || !password) {
    return res.status(400).json({ error: t(acceptLanguage, 'emailRequired') });
  }

  try {
    // Check if user already exists
    const userCheck = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: t(acceptLanguage, 'accountExists') });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into DB
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.trim().toLowerCase(), passwordHash]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at,
      },
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'signupError') });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const acceptLanguage = req.headers['accept-language'] as string | undefined;

  if (!email || !password) {
    return res.status(400).json({ error: t(acceptLanguage, 'emailRequired') });
  }

  try {
    // Check if user exists
    const userCheck = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: t(acceptLanguage, 'invalidCredentials') });
    }

    const user = userCheck.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: t(acceptLanguage, 'invalidCredentials') });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'loginError') });
  }
});

// 3. Get Current User Profile (Me)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const acceptLanguage = req.headers['accept-language'] as string | undefined;
  try {
    const result = await query('SELECT id, email, created_at FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: t(acceptLanguage, 'userNotFound') });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: t(acceptLanguage, 'profileError') });
  }
});

// 5. Admin endpoint to list registered users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    return res.json({ total: result.rows.length, users: result.rows });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ error: 'Failed to fetch registered users' });
  }
});

export default router;

