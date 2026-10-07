import { Router } from 'express';
import { register, login, getMe, logout, forgotPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

export default router;
