import express from 'express';
import { 
  getStats, getFinancialStats, getFinancialAnalytics, getRecentActivity, 
  getUsers, toggleBlockUser, changeUserRole, getTransactions, suspendUser, 
  activateUser, softDeleteUser, restoreUser, bulkSuspend, bulkActivate, bulkDelete,
  getCourses, getCourseStats, changeCourseStatus, softDeleteAdminCourse, bulkUpdateCourses,
  getLessonStats, getLessons, changeLessonStatus, softDeleteLesson, bulkUpdateLessons,
  getCategoryStats, getCategories, createCategory, updateCategory, softDeleteCategory, bulkUpdateCategories
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes in this file to admins and superadmins
router.use(protect, authorize('admin', 'superadmin'));

router.get('/stats', getStats);
router.get('/financial', getFinancialStats);
router.get('/financial/analytics', getFinancialAnalytics);
router.get('/activity', getRecentActivity);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser); // Keep for backwards compatibility
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);
router.delete('/users/:id/soft-delete', softDeleteUser);
router.patch('/users/:id/restore', restoreUser);

router.post('/users/bulk-suspend', bulkSuspend);
router.post('/users/bulk-activate', bulkActivate);
router.post('/users/bulk-delete', bulkDelete);

router.get('/transactions', getTransactions);

// --- Course Management Routes ---
router.get('/courses/stats', getCourseStats);
router.get('/courses', getCourses);
router.patch('/courses/:id/status', changeCourseStatus);
router.delete('/courses/:id', softDeleteAdminCourse);
router.post('/courses/bulk', bulkUpdateCourses);

// --- Lesson Management Routes ---
router.get('/lessons/stats', getLessonStats);
router.get('/lessons', getLessons);
router.patch('/lessons/:id/status', changeLessonStatus);
router.delete('/lessons/:id', softDeleteLesson);
router.post('/lessons/bulk', bulkUpdateLessons);

// --- Category Management Routes ---
router.get('/categories/stats', getCategoryStats);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', softDeleteCategory);
router.post('/categories/bulk', bulkUpdateCategories);

export default router;
