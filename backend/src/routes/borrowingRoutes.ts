import { Router } from 'express';
import { getMyBorrowings, borrowBook, returnBook, renewBook } from '../controllers/borrowingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/my', getMyBorrowings);
router.post('/', borrowBook);
router.patch('/:id/return', returnBook);
router.patch('/:id/renew', renewBook);

export default router;
