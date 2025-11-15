/**
 * Custom modules
 */
import { logger } from '../helpers/winston';
import { NotFoundError } from '../utils/errorHandle';
import { emitToUser, emitToUsers } from '../config/configSocketIO';

/**
 * Models
 */
import { Notification } from '../models/Notification';

/**
 * Types
 */
import type { Types } from 'mongoose';

class NotificationService {
  /**
   * Tạo notification mới và emit real-time
   */
  async createNotification(data: {
    user_id: string | Types.ObjectId;
    title: string;
    content?: string;
    type: string;
    link?: string;
  }) {
    const notification = await Notification.create(data);

    // Emit real-time notification
    emitToUser(data.user_id.toString(), 'notification:new', {
      notification: notification.toJSON(),
    });

    logger.info(`Notification created and sent to user ${data.user_id}`);

    return notification;
  }

  /**
   * Tạo notification cho nhiều users
   */
  async createNotificationForUsers(
    userIds: (string | Types.ObjectId)[],
    data: {
      title: string;
      content?: string;
      type: string;
      link?: string;
    }
  ) {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        Notification.create({
          user_id: userId,
          ...data,
        })
      )
    );

    // Emit real-time notifications
    emitToUsers(
      userIds.map((id) => id.toString()),
      'notification:new',
      {
        title: data.title,
        content: data.content,
        type: data.type,
      }
    );

    logger.info(`Notifications created for ${userIds.length} users`);

    return notifications;
  }

  /**
   * Get notifications của user
   */
  async getNotificationsByUser(
    userId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const skip = (page - 1) * limit;

    const query: any = { user_id: userId };
    if (unreadOnly) {
      query.is_read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countUnreadByUser(userId),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string | Types.ObjectId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Thông báo không tồn tại');
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string | Types.ObjectId, userId: string) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Thông báo không tồn tại');
    }

    // Check ownership
    if (notification.user_id.toString() !== userId) {
      throw new NotFoundError('Thông báo không tồn tại');
    }

    await notification.markAsRead();

    // Emit update
    emitToUser(userId, 'notification:read', {
      notificationId: notificationId.toString(),
    });

    logger.info(`Notification ${notificationId} marked as read`);

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string | Types.ObjectId) {
    await Notification.markAllAsReadByUser(userId);

    // Emit update
    emitToUser(userId.toString(), 'notification:all-read', {});

    logger.info(`All notifications marked as read for user ${userId}`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string | Types.ObjectId) {
    const count = await Notification.countUnreadByUser(userId);
    return count;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string | Types.ObjectId, userId: string) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Thông báo không tồn tại');
    }

    // Check ownership
    if (notification.user_id.toString() !== userId) {
      throw new NotFoundError('Thông báo không tồn tại');
    }

    await Notification.findByIdAndDelete(notificationId);

    logger.info(`Notification ${notificationId} deleted`);

    return notification;
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 30) {
    const deletedCount = await Notification.deleteOldNotifications(daysOld);

    logger.info(`Deleted ${deletedCount} old notifications`);

    return deletedCount;
  }
}

export default new NotificationService();