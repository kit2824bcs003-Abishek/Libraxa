import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getProfile = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = db.prepare(`
      SELECT id, name, email, student_id, department, role, created_at
      FROM users
      WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const borrowedCount = (db.prepare('SELECT COUNT(*) AS count FROM borrowings WHERE user_id = ?').get(userId) as any)?.count || 0;
    const returnedCount = (db.prepare('SELECT COUNT(*) AS count FROM borrowings WHERE user_id = ? AND status = \'returned\'').get(userId) as any)?.count || 0;
    const activeBorrowCount = (db.prepare('SELECT COUNT(*) AS count FROM borrowings WHERE user_id = ? AND status = \'borrowed\'').get(userId) as any)?.count || 0;
    const reservationsCount = (db.prepare('SELECT COUNT(*) AS count FROM reservations WHERE user_id = ? AND status = \'active\'').get(userId) as any)?.count || 0;

    const fineStats = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS outstanding,
        COALESCE(SUM(amount), 0) AS total
      FROM fines
      WHERE user_id = ?
    `).get(userId) as any;

    return res.json({
      success: true,
      data: {
        user,
        stats: {
          books_borrowed: borrowedCount,
          books_returned: returnedCount,
          currently_borrowed: activeBorrowCount,
          active_reservations: reservationsCount,
          outstanding_fines: fineStats?.outstanding || 0,
          total_fines: fineStats?.total || 0,
        },
      },
    });
  } catch (err: any) {
    console.error('getProfile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.',
    });
  }
};

export const updateProfile = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, department, student_id } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, department = ?, student_id = ?
      WHERE id = ?
    `).run(name.trim(), department?.trim() || null, student_id?.trim() || null, userId);

    const updated = db.prepare(`
      SELECT id, name, email, student_id, department, role, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};
