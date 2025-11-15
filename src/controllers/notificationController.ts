/**
 * Custom modules
 */
import notificationService from '../services/notificationService';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

class NotificationController {
  /**
   * Tạo notification (admin/teacher)
   */
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const notification = await notificationService.createNotification(data);

      res.status(201).json({
        success: true,
        message: 'Tạo thông báo thành công',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notifications của user
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await notificationService.getNotificationsByUser(
        userId,
        page,
        limit,
        unreadOnly
      );

      res.json({
        success: true,
        message: 'Lấy danh sách thông báo thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;

      const notification = await notificationService.getNotificationById(notificationId);

      res.json({
        success: true,
        message: 'Lấy thông báo thành công',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.userId!;

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Đánh dấu đã đọc thành công',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Đánh dấu tất cả đã đọc thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        message: 'Lấy số thông báo chưa đọc thành công',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.userId!;

      await notificationService.deleteNotification(notificationId, userId);

      res.json({
        success: true,
        message: 'Xóa thông báo thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();