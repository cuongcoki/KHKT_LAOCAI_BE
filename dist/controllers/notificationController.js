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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = __importDefault(require("../services/notificationService"));
class NotificationController {
    createNotification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const notification = yield notificationService_1.default.createNotification(data);
                res.status(201).json({
                    success: true,
                    message: 'Tạo thông báo thành công',
                    data: notification,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getNotifications(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const unreadOnly = req.query.unreadOnly === 'true';
                const result = yield notificationService_1.default.getNotificationsByUser(userId, page, limit, unreadOnly);
                res.json({
                    success: true,
                    message: 'Lấy danh sách thông báo thành công',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getNotificationById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { notificationId } = req.params;
                const notification = yield notificationService_1.default.getNotificationById(notificationId);
                res.json({
                    success: true,
                    message: 'Lấy thông báo thành công',
                    data: notification,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    markAsRead(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { notificationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const notification = yield notificationService_1.default.markAsRead(notificationId, userId);
                res.json({
                    success: true,
                    message: 'Đánh dấu đã đọc thành công',
                    data: notification,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    markAllAsRead(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                yield notificationService_1.default.markAllAsRead(userId);
                res.json({
                    success: true,
                    message: 'Đánh dấu tất cả đã đọc thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUnreadCount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const count = yield notificationService_1.default.getUnreadCount(userId);
                res.json({
                    success: true,
                    message: 'Lấy số thông báo chưa đọc thành công',
                    data: { count },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteNotification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { notificationId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                yield notificationService_1.default.deleteNotification(notificationId, userId);
                res.json({
                    success: true,
                    message: 'Xóa thông báo thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new NotificationController();
