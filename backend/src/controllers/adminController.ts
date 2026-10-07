import { Request, Response } from 'express';
import db from '../database/connection.js';

export const getAdminDashboardStats = (_req: Request, res: Response) => {
  try {
    const totalBooksRow = db.prepare('SELECT SUM(total_copies) as total_copies, COUNT(id) as titles_count FROM books').get() as any;
    const availableBooksRow = db.prepare('SELECT SUM(available_copies) as available_copies FROM books').get() as any;
    const borrowedRow = db.prepare('SELECT COUNT(*) as count FROM borrowings WHERE status = \'borrowed\'').get() as any;
    const overdueRow = db.prepare('SELECT COUNT(*) as count FROM borrowings WHERE status = \'overdue\'').get() as any;
    const studentsRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = \'student\'').get() as any;
    const finesRow = db.prepare('SELECT COALESCE(SUM(amount), 0) as total_fines FROM fines').get() as any;

    return res.json({
      success: true,
      data: {
        total_books: totalBooksRow?.total_copies || 0,
        total_titles: totalBooksRow?.titles_count || 0,
        available_books: availableBooksRow?.available_copies || 0,
        borrowed_books: borrowedRow?.count || 0,
        overdue_books: overdueRow?.count || 0,
        registered_students: studentsRow?.count || 0,
        total_fines: finesRow?.total_fines || 0,
      },
    });
  } catch (err: any) {
    console.error('getAdminDashboardStats error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard metrics.',
    });
  }
};

export const getAdminBooks = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT b.*, c.name AS category_name
      FROM books b
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.id DESC
    `);
    const books = stmt.all();

    return res.json({
      success: true,
      data: books,
    });
  } catch (err: any) {
    console.error('getAdminBooks error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load library inventory.',
    });
  }
};

export const getAdminBorrowings = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        b.id,
        b.user_id,
        b.book_id,
        b.borrowed_at,
        b.due_at,
        b.returned_at,
        b.status,
        b.fine_amount,
        u.name AS student_name,
        u.email AS student_email,
        u.student_id,
        u.department,
        bk.title AS book_title,
        bk.isbn AS book_isbn
      FROM borrowings b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.borrowed_at DESC
    `);
    const borrowings = stmt.all();

    return res.json({
      success: true,
      data: borrowings,
    });
  } catch (err: any) {
    console.error('getAdminBorrowings error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load borrowing records.',
    });
  }
};

export const adminMarkReturned = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const borrowing = db.prepare('SELECT * FROM borrowings WHERE id = ?').get(id) as any;
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found.',
      });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book already marked returned.',
      });
    }

    const returnDateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE borrowings 
      SET status = 'returned', returned_at = ?
      WHERE id = ?
    `).run(returnDateStr, id);

    db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(borrowing.book_id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Return Processed by Librarian', 'Your borrowed book has been received and verified by library staff.')
    `).run(borrowing.user_id);

    return res.json({
      success: true,
      message: 'Borrowing marked as returned successfully.',
    });
  } catch (err: any) {
    console.error('adminMarkReturned error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update borrowing status.',
    });
  }
};

export const adminExtendDue = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days = 14 } = req.body;

    const borrowing = db.prepare('SELECT * FROM borrowings WHERE id = ?').get(id) as any;
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found.',
      });
    }

    const currentDue = new Date(borrowing.due_at);
    currentDue.setDate(currentDue.getDate() + Number(days));
    const newDueStr = currentDue.toISOString().replace('T', ' ').substring(0, 19);

    db.prepare('UPDATE borrowings SET due_at = ?, status = \'borrowed\' WHERE id = ?').run(newDueStr, id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Due Date Extended by Staff', ?)
    `).run(borrowing.user_id, `Staff extended your loan deadline to ${currentDue.toLocaleDateString()}.`);

    return res.json({
      success: true,
      message: `Due date extended by ${days} days.`,
      data: {
        due_at: newDueStr,
      },
    });
  } catch (err: any) {
    console.error('adminExtendDue error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to extend loan deadline.',
    });
  }
};
