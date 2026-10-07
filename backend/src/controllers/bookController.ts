import { Request, Response } from 'express';
import db from '../database/connection.js';

export const getBooks = (req: Request, res: Response) => {
  try {
    const { search, category, sort } = req.query;

    let query = `
      SELECT b.*, c.name AS category_name, c.slug AS category_slug
      FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR c.name LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (category && typeof category === 'string' && category !== 'all' && category !== 'All') {
      query += ` AND (c.slug = ? OR c.name = ?)`;
      params.push(category, category);
    }

    // Sort order
    if (sort === 'popular') {
      query += ` ORDER BY b.rating DESC, b.id ASC`;
    } else if (sort === 'recent') {
      query += ` ORDER BY b.publication_year DESC, b.id DESC`;
    } else if (sort === 'title-asc' || sort === 'Title A-Z') {
      query += ` ORDER BY b.title ASC`;
    } else {
      query += ` ORDER BY b.id ASC`;
    }

    const stmt = db.prepare(query);
    const books = stmt.all(...params);

    return res.json({
      success: true,
      data: books,
    });
  } catch (err: any) {
    console.error('getBooks error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve books from catalog.',
    });
  }
};

export const getBookById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT b.*, c.name AS category_name, c.slug AS category_slug, c.description AS category_description
      FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `);
    const book = stmt.get(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    return res.json({
      success: true,
      data: book,
    });
  } catch (err: any) {
    console.error('getBookById error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error fetching book details.',
    });
  }
};

export const createBook = (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      isbn,
      category_id,
      publisher,
      publication_year,
      pages,
      language,
      description,
      total_copies,
      cover_url,
    } = req.body;

    if (!title || !author || !isbn || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, ISBN, and category are required.',
      });
    }

    const checkIsbn = db.prepare('SELECT id FROM books WHERE isbn = ?').get(isbn);
    if (checkIsbn) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists.',
      });
    }

    const copies = total_copies ? parseInt(total_copies, 10) : 1;
    const stmt = db.prepare(`
      INSERT INTO books (
        title, author, isbn, category_id, publisher, publication_year,
        pages, language, description, total_copies, available_copies,
        rating, cover_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, ?)
    `);

    const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    const result = stmt.run(
      title.trim(),
      author.trim(),
      isbn.trim(),
      category_id,
      publisher?.trim() || 'Academic Press',
      publication_year ? parseInt(publication_year, 10) : new Date().getFullYear(),
      pages ? parseInt(pages, 10) : 320,
      language?.trim() || 'English',
      description?.trim() || 'Comprehensive academic textbook covering fundamentals and applied methodologies.',
      copies,
      copies,
      cover_url?.trim() || defaultCover
    );

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Book successfully added to catalog.',
      data: newBook,
    });
  } catch (err: any) {
    console.error('createBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add book.',
    });
  }
};

export const updateBook = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id) as any;

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    const {
      title = book.title,
      author = book.author,
      isbn = book.isbn,
      category_id = book.category_id,
      publisher = book.publisher,
      publication_year = book.publication_year,
      pages = book.pages,
      language = book.language,
      description = book.description,
      total_copies = book.total_copies,
      available_copies = book.available_copies,
      cover_url = book.cover_url,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE books
      SET title = ?, author = ?, isbn = ?, category_id = ?, publisher = ?,
          publication_year = ?, pages = ?, language = ?, description = ?,
          total_copies = ?, available_copies = ?, cover_url = ?
      WHERE id = ?
    `);

    stmt.run(
      title,
      author,
      isbn,
      category_id,
      publisher,
      Number(publication_year),
      Number(pages),
      language,
      description,
      Number(total_copies),
      Number(available_copies),
      cover_url,
      id
    );

    const updated = db.prepare(`
      SELECT b.*, c.name AS category_name
      FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(id);

    return res.json({
      success: true,
      message: 'Book updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('updateBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update book.',
    });
  }
};

export const deleteBook = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.prepare('SELECT id FROM books WHERE id = ?').get(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: 'Book deleted successfully from catalog.',
    });
  } catch (err: any) {
    console.error('deleteBook error:', err);
    return res.status(500).json({
      success: false,
      message: 'Cannot delete book with active borrowing records or dependencies.',
    });
  }
};

export const getCategories = (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT c.*, COUNT(b.id) AS book_count
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    const categories = stmt.all();

    return res.json({
      success: true,
      data: categories,
    });
  } catch (err: any) {
    console.error('getCategories error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
    });
  }
};
