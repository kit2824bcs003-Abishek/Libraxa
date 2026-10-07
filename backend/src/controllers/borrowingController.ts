import { Response } from 'express';
import db from '../database/connection.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getMyBorrowings = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

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
        bk.title AS book_title,
        bk.author AS book_author,
        bk.cover_url AS book_cover,
        bk.isbn AS book_isbn,
        c.name AS category_name
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      JOIN categories c ON bk.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY 
        CASE WHEN b.status = 'borrowed' THEN 1 ELSE 2 END,
        b.due_at ASC
    `);

    const borrowings = stmt.all(userId) as any[];

    // Calculate live dynamic status and overdue days
    const now = new Date();
    const formatted = borrowings.map((borrowing) => {
      let isOverdue = false;
      let daysRemaining = 0;
      let overdueDays = 0;

      const dueDate = new Date(borrowing.due_at);

      if (borrowing.status === 'borrowed') {
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          isOverdue = true;
          overdueDays = Math.abs(diffDays);
        } else {
          daysRemaining = diffDays;
        }
      }

      return {
        ...borrowing,
        is_overdue: isOverdue,
        days_remaining: daysRemaining,
        overdue_days: overdueDays,
      };
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    console.error('getMyBorrowings error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your borrowed books.',
    });
  }
};

export const borrowBook = (req: AuthenticatedRequest, res: Response) => {
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
        message: 'Book not found in library catalog.',
      });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is currently unavailable. You may place a reservation instead.',
      });
    }

    // Check if user already borrowed this book and hasn't returned it yet
    const existingBorrow = db.prepare(`
      SELECT id FROM borrowings
      WHERE user_id = ? AND book_id = ? AND status = 'borrowed'
    `).get(userId, book_id);

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book. Please return or renew your current copy.',
      });
    }

    // Calculate dates: 14 days standard loan
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowDateStr = borrowDate.toISOString().replace('T', ' ').substring(0, 19);
    const dueDateStr = dueDate.toISOString().replace('T', ' ').substring(0, 19);

    // Update book available copies
    db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(book_id);

    // Insert borrowing record
    const insertStmt = db.prepare(`
      INSERT INTO borrowings (user_id, book_id, borrowed_at, due_at, status, fine_amount)
      VALUES (?, ?, ?, ?, 'borrowed', 0)
    `);
    const result = insertStmt.run(userId, book_id, borrowDateStr, dueDateStr);

    // Create user notification
    const formattedDueDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Book Borrowed Successfully', ?)
    `).run(userId, `You borrowed "${book.title}". Due date is ${formattedDueDate} (14 days loan period).`);

    const createdBorrowing = db.prepare(`
      SELECT b.*, bk.title AS book_title, bk.author AS book_author, bk.cover_url AS book_cover
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Book borrowed successfully.',
      data: createdBorrowing,
    });
  } catch (err: any) {
    console.error('borrowBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete book borrowing.',
    });
  }
};

export const returnBook = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const borrowing = db.prepare(`
      SELECT b.*, bk.title AS book_title
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found.',
      });
    }

    // Allow user who borrowed it OR librarian/admin to return
    if (borrowing.user_id !== userId && req.user!.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to return this record.',
      });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been returned.',
      });
    }

    const returnDate = new Date();
    const dueDate = new Date(borrowing.due_at);
    const returnDateStr = returnDate.toISOString().replace('T', ' ').substring(0, 19);

    let fine = 0;
    const diffTime = returnDate.getTime() - dueDate.getTime();
    if (diffTime > 0) {
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = overdueDays * 5; // ₹5 per day
    }

    // Update borrowing record
    db.prepare(`
      UPDATE borrowings 
      SET status = 'returned', returned_at = ?, fine_amount = ?
      WHERE id = ?
    `).run(returnDateStr, fine, id);

    // Increment available book copies
    db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(borrowing.book_id);

    // If fine is incurred, record it
    if (fine > 0) {
      db.prepare(`
        INSERT INTO fines (user_id, borrowing_id, amount, status)
        VALUES (?, ?, ?, 'pending')
      `).run(borrowing.user_id, id, fine);

      db.prepare(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, 'Overdue Fine Incurred', ?)
      `).run(borrowing.user_id, `An overdue fine of ₹${fine} has been issued for late return of "${borrowing.book_title}".`);
    } else {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message)
        VALUES (?, 'Book Returned Successfully', ?)
      `).run(borrowing.user_id, `"${borrowing.book_title}" has been successfully returned. Thank you!`);
    }

    return res.json({
      success: true,
      message: 'Book returned successfully.',
      data: {
        borrowing_id: id,
        fine_amount: fine,
        returned_at: returnDateStr,
      },
    });
  } catch (err: any) {
    console.error('returnBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to return book.',
    });
  }
};

export const renewBook = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const borrowing = db.prepare(`
      SELECT b.*, bk.title AS book_title
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found.',
      });
    }

    if (borrowing.user_id !== userId && req.user!.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to renew this record.',
      });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew a book that has already been returned.',
      });
    }

    // Extend due date by 14 days
    const currentDue = new Date(borrowing.due_at);
    const newDue = new Date(Math.max(currentDue.getTime(), Date.now()));
    newDue.setDate(newDue.getDate() + 14);
    const newDueStr = newDue.toISOString().replace('T', ' ').substring(0, 19);

    db.prepare('UPDATE borrowings SET due_at = ?, status = \'borrowed\' WHERE id = ?').run(newDueStr, id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, 'Book Loan Renewed', ?)
    `).run(borrowing.user_id, `Loan for "${borrowing.book_title}" renewed. New due date is ${newDue.toLocaleDateString()}.`);

    return res.json({
      success: true,
      message: 'Loan renewed successfully. Due date extended by 14 days.',
      data: {
        id,
        due_at: newDueStr,
      },
    });
  } catch (err: any) {
    console.error('renewBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to renew book.',
    });
  }
};
