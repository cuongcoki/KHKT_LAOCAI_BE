"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = __importDefault(require("../../controllers/notificationController"));
const authorize_1 = require("../../middlewares/authorize");
const router = express_1.default.Router();
router.post('/', (0, authorize_1.authorize)('admin', 'teacher'), notificationController_1.default.createNotification);
router.get('/', notificationController_1.default.getNotifications);
router.get('/unread-count', notificationController_1.default.getUnreadCount);
router.get('/:notificationId', notificationController_1.default.getNotificationById);
router.put('/:notificationId/read', notificationController_1.default.markAsRead);
router.put('/mark-all-read', notificationController_1.default.markAllAsRead);
router.delete('/:notificationId', notificationController_1.default.deleteNotification);
exports.default = router;
