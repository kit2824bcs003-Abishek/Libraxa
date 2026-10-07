import { Router } from 'express';
import { getAdminDashboardStats, getAdminBooks, getAdminBorrowings, adminMarkReturned, adminExtendDue } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('librarian', 'admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/books', getAdminBooks);
router.get('/borrowings', getAdminBorrowings);
router.patch('/borrowings/:id/return', adminMarkReturned);
router.patch('/borrowings/:id/extend', adminExtendDue);

export default router;
