import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getMyFines = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const stmt = db.prepare(`
      SELECT 
        f.id,
        f.user_id,
        f.borrowing_id,
        f.amount,
        f.status,
        f.created_at,
        f.paid_at,
        bk.title AS book_title,
        b.borrowed_at,
        b.due_at,
        b.returned_at
      FROM fines f
      LEFT JOIN borrowings b ON f.borrowing_id = b.id
      LEFT JOIN books bk ON b.book_id = bk.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `);

    const fines = stmt.all(userId) as any[];

    let outstanding = 0;
    let paid = 0;

    for (const f of fines) {
      if (f.status === 'pending') {
        outstanding += f.amount;
      } else if (f.status === 'paid') {
        paid += f.amount;
      }
    }

    return res.json({
      success: true,
      data: {
        outstanding,
        paid,
        total: outstanding + paid,
        fines,
      },
    });
  } catch (err: any) {
    console.error('getMyFines error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve fines information.',
    });
  }
};

export const payFine = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const fine = db.prepare('SELECT * FROM fines WHERE id = ?').get(id) as any;
    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine record not found.',
      });
    }

    if (fine.user_id !== userId && req.user!.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied.',
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fine has already been paid.',
      });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.prepare('UPDATE fines SET status = \'paid\', paid_at = ? WHERE id = ?').run(nowStr, id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Fine Payment Confirmed', ?)
    `).run(fine.user_id, `Payment of ₹${fine.amount} for library fine #${id} has been recorded successfully.`);

    return res.json({
      success: true,
      message: 'Payment recorded successfully.',
      data: {
        fine_id: id,
        amount: fine.amount,
        status: 'paid',
        paid_at: nowStr,
      },
    });
  } catch (err: any) {
    console.error('payFine error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process fine payment.',
    });
  }
};
