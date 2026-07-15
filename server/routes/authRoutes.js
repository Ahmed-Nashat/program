import express from 'express';
import { register, login, logout, getMe, checkEmail } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/check-email', authLimiter, checkEmail);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe); // protect runs first — if it fails, getMe never runs

export default router;
