import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getMyReservations = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const stmt = db.prepare(`
      SELECT 
        r.id,
        r.user_id,
        r.book_id,
        r.reserved_at,
        r.status,
        bk.title AS book_title,
        bk.author AS book_author,
        bk.cover_url AS book_cover,
        bk.available_copies,
        bk.isbn AS book_isbn,
        c.name AS category_name
      FROM reservations r
      JOIN books bk ON r.book_id = bk.id
      JOIN categories c ON bk.category_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.reserved_at DESC
    `);

    const reservations = stmt.all(userId) as any[];

    // Calculate queue position for active reservations
    const formatted = reservations.map((resv) => {
      let position = 1;
      if (resv.status === 'active') {
        const queueStmt = db.prepare(`
          SELECT COUNT(*) AS count
          FROM reservations
          WHERE book_id = ? AND status = 'active' AND reserved_at < ?
        `);
        const row = queueStmt.get(resv.book_id, resv.reserved_at) as any;
        position = (row?.count || 0) + 1;
      }
      return {
        ...resv,
        queue_position: position,
      };
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    console.error('getMyReservations error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your reservations.',
    });
  }
};

export const createReservation = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required.',
      });
    }

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id) as any;
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    // Check if user already has an active reservation
    const existing = db.prepare(`
      SELECT id FROM reservations
      WHERE user_id = ? AND book_id = ? AND status = 'active'
    `).get(userId, book_id);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active reservation for this book.',
      });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const result = db.prepare(`
      INSERT INTO reservations (user_id, book_id, reserved_at, status)
      VALUES (?, ?, ?, 'active')
    `).run(userId, book_id, nowStr);

    // Calculate queue position
    const queueStmt = db.prepare(`
      SELECT COUNT(*) AS count
      FROM reservations
      WHERE book_id = ? AND status = 'active' AND reserved_at <= ?
    `);
    const countRow = queueStmt.get(book_id, nowStr) as any;
    const position = countRow?.count || 1;

    // Create notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Reservation Confirmed', ?)
    `).run(userId, `You have reserved "${book.title}". You are #${position} in the waitlist.`);

    const created = db.prepare(`
      SELECT r.*, bk.title AS book_title, bk.author AS book_author, bk.cover_url AS book_cover, bk.available_copies
      FROM reservations r
      JOIN books bk ON r.book_id = bk.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid) as any;

    return res.status(201).json({
      success: true,
      message: 'Book reservation placed successfully.',
      data: {
        ...created,
        queue_position: position,
      },
    });
  } catch (err: any) {
    console.error('createReservation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to place reservation.',
    });
  }
};

export const cancelReservation = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const resv = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as any;
    if (!resv) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    if (resv.user_id !== userId && req.user!.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to cancel this reservation.',
      });
    }

    db.prepare('UPDATE reservations SET status = \'cancelled\' WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: 'Reservation cancelled successfully.',
    });
  } catch (err: any) {
    console.error('cancelReservation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation.',
    });
  }
};
