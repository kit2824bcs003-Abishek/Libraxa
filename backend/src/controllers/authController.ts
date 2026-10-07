import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/connection.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User, SafeUser, AuthTokenPayload } from '../types/index.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, student_id, department, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existing = checkStmt.get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, student_id, department, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'student')
    `);

    const result = insertStmt.run(
      name.trim(),
      email.toLowerCase().trim(),
      student_id ? student_id.trim() : null,
      department ? department.trim() : 'Computer Science & Engineering',
      password_hash
    );

    const newUserId = Number(result.lastInsertRowid);

    // Create a welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Welcome to LIBRIXA', 'Your library account is active. Explore books, manage reservations, and track due dates.')
    `).run(newUserId);

    const safeUser: SafeUser = {
      id: newUserId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      student_id: student_id ? student_id.trim() : null,
      department: department ? department.trim() : 'Computer Science & Engineering',
      role: 'student',
      created_at: new Date().toISOString(),
    };

    const payload: AuthTokenPayload = {
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Library account created successfully.',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email.toLowerCase().trim()) as User | undefined;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { password_hash, ...safeUser } = user;

    const payload: AuthTokenPayload = {
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const stmt = db.prepare('SELECT id, name, email, student_id, department, role, created_at FROM users WHERE id = ?');
    const user = stmt.get(req.user.id) as SafeUser | undefined;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving user data' });
  }
};

export const logout = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const forgotPassword = (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your registered email address.',
    });
  }

  // Simulated email response per requirement
  return res.json({
    success: true,
    message: 'Password reset instructions have been sent to your email.',
  });
};
