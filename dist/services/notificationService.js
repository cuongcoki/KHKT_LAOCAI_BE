"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../helpers/winston");
const errorHandle_1 = require("../utils/errorHandle");
const configSocketIO_1 = require("../config/configSocketIO");
const Notification_1 = require("../models/Notification");
class NotificationService {
    createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.Notification.create(data);
            (0, configSocketIO_1.emitToUser)(data.user_id.toString(), 'notification:new', {
                notification: notification.toJSON(),
            });
            winston_1.logger.info(`Notification created and sent to user ${data.user_id}`);
            return notification;
        });
    }
    createNotificationForUsers(userIds, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield Promise.all(userIds.map((userId) => Notification_1.Notification.create(Object.assign({ user_id: userId }, data))));
            (0, configSocketIO_1.emitToUsers)(userIds.map((id) => id.toString()), 'notification:new', {
                title: data.title,
                content: data.content,
                type: data.type,
            });
            winston_1.logger.info(`Notifications created for ${userIds.length} users`);
            return notifications;
        });
    }
    getNotificationsByUser(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 20, unreadOnly = false) {
            const skip = (page - 1) * limit;
            const query = { user_id: userId };
            if (unreadOnly) {
                query.is_read = false;
            }
            const [notifications, total, unreadCount] = yield Promise.all([
                Notification_1.Notification.find(query)
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Notification_1.Notification.countDocuments(query),
                Notification_1.Notification.countUnreadByUser(userId),
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
        });
    }
    getNotificationById(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.Notification.findById(notificationId);
            if (!notification) {
                throw new errorHandle_1.NotFoundError('Thông báo không tồn tại');
            }
            return notification;
        });
    }
    markAsRead(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.Notification.findById(notificationId);
            if (!notification) {
                throw new errorHandle_1.NotFoundError('Thông báo không tồn tại');
            }
            if (notification.user_id.toString() !== userId) {
                throw new errorHandle_1.NotFoundError('Thông báo không tồn tại');
            }
            yield notification.markAsRead();
            (0, configSocketIO_1.emitToUser)(userId, 'notification:read', {
                notificationId: notificationId.toString(),
            });
            winston_1.logger.info(`Notification ${notificationId} marked as read`);
            return notification;
        });
    }
    markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Notification_1.Notification.markAllAsReadByUser(userId);
            (0, configSocketIO_1.emitToUser)(userId.toString(), 'notification:all-read', {});
            winston_1.logger.info(`All notifications marked as read for user ${userId}`);
        });
    }
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield Notification_1.Notification.countUnreadByUser(userId);
            return count;
        });
    }
    deleteNotification(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.Notification.findById(notificationId);
            if (!notification) {
                throw new errorHandle_1.NotFoundError('Thông báo không tồn tại');
            }
            if (notification.user_id.toString() !== userId) {
                throw new errorHandle_1.NotFoundError('Thông báo không tồn tại');
            }
            yield Notification_1.Notification.findByIdAndDelete(notificationId);
            winston_1.logger.info(`Notification ${notificationId} deleted`);
            return notification;
        });
    }
    deleteOldNotifications() {
        return __awaiter(this, arguments, void 0, function* (daysOld = 30) {
            const deletedCount = yield Notification_1.Notification.deleteOldNotifications(daysOld);
            winston_1.logger.info(`Deleted ${deletedCount} old notifications`);
            return deletedCount;
        });
    }
}
exports.default = new NotificationService();
