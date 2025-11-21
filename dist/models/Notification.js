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
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID là bắt buộc'],
    },
    title: {
        type: String,
        required: [true, 'Tiêu đề thông báo là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    content: {
        type: String,
        trim: true,
        maxlength: [1000, 'Nội dung tối đa 1000 ký tự'],
    },
    type: {
        type: String,
        required: [true, 'Loại thông báo là bắt buộc'],
        enum: {
            values: ['info', 'warning', 'success', 'error', 'assignment', 'quiz', 'grade', 'announcement'],
            message: '{VALUE} không phải là loại thông báo hợp lệ',
        },
        default: 'info',
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        trim: true,
        maxlength: [500, 'Link tối đa 500 ký tự'],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
NotificationSchema.index({ user_id: 1 });
NotificationSchema.index({ is_read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ created_at: -1 });
NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
NotificationSchema.virtual('is_new').get(function () {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.created_at > oneDayAgo;
});
NotificationSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});
NotificationSchema.methods.markAsRead = function () {
    if (this.is_read) {
        return Promise.resolve(this);
    }
    this.is_read = true;
    return this.save();
};
NotificationSchema.methods.markAsUnread = function () {
    if (!this.is_read) {
        return Promise.resolve(this);
    }
    this.is_read = false;
    return this.save();
};
NotificationSchema.statics.findByUser = function (userId, options) {
    const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
    const unreadOnly = (options === null || options === void 0 ? void 0 : options.unreadOnly) || false;
    const query = { user_id: userId };
    if (unreadOnly) {
        query.is_read = false;
    }
    return this.find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};
NotificationSchema.statics.countUnreadByUser = function (userId) {
    return this.countDocuments({ user_id: userId, is_read: false });
};
NotificationSchema.statics.markAllAsReadByUser = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.updateMany({ user_id: userId, is_read: false }, { $set: { is_read: true } });
    });
};
NotificationSchema.statics.deleteOldNotifications = function () {
    return __awaiter(this, arguments, void 0, function* (daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = yield this.deleteMany({
            created_at: { $lt: cutoffDate },
            is_read: true,
        });
        return result.deletedCount || 0;
    });
};
NotificationSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
NotificationSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
