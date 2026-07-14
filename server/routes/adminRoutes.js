import express from 'express';
import { getStats, getUsers, toggleBlockUser, demoteUser, getTransactions } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes in this file to admins and superadmins
router.use(protect, authorize('admin', 'superadmin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/demote', demoteUser);
router.get('/transactions', getTransactions);

export default router;
