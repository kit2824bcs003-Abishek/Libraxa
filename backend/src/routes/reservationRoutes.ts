import { Router } from 'express';
import { getMyReservations, createReservation, cancelReservation } from '../controllers/reservationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/my', getMyReservations);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);

export default router;
