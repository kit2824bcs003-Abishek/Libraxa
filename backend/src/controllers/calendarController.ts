import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getCalendarData = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch library events
    const events = db.prepare('SELECT * FROM library_events ORDER BY event_date ASC').all();

    // Fetch user's active borrowings and due dates
    const dueDates = db.prepare(`
      SELECT b.id, b.due_at, bk.title AS book_title
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.user_id = ? AND b.status = 'borrowed'
    `).all(userId);

    return res.json({
      success: true,
      data: {
        month: 'October 2026',
        events,
        user_due_dates: dueDates,
      },
    });
  } catch (err: any) {
    console.error('getCalendarData error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calendar data.',
    });
  }
};
