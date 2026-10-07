import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, getCategories } from '../controllers/bookController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);

// Admin / Librarian protected routes
router.post('/', authenticateToken, requireRole('librarian', 'admin'), createBook);
router.patch('/:id', authenticateToken, requireRole('librarian', 'admin'), updateBook);
router.delete('/:id', authenticateToken, requireRole('librarian', 'admin'), deleteBook);

export default router;
