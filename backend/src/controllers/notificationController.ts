import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getNotifications = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const notifications = stmt.all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) AS count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(userId) as any;

    return res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount?.count || 0,
      },
    });
  } catch (err: any) {
    console.error('getNotifications error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
};

export const markAsRead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

    return res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err: any) {
    console.error('markAsRead error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
    });
  }
};

export const markAllAsRead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    db.prepare(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
    `).run(userId);

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err: any) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
    });
  }
};
