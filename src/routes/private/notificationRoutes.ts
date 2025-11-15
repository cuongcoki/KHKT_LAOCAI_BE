import express from 'express';
import notificationController from '@/controllers/notificationController';
import { authorize } from "@/middlewares/authorize";

const router = express.Router();

/**
 * @route   POST /api/notifications
 * @desc    Tạo notification (admin/teacher)
 * @access  Private/Admin/Teacher
 */
router.post(
  '/',
  authorize('admin', 'teacher'),
  notificationController.createNotification
);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications của user
 * @access  Private
 */
router.get('/',  notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread count
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/:notificationId
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:notificationId', notificationController.getNotificationById);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;