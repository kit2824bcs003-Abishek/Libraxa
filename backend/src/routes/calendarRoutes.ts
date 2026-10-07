import { Router } from 'express';
import { getCalendarData } from '../controllers/calendarController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getCalendarData);

export default router;
