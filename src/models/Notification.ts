/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho Notification instance methods
 */
interface INotificationMethods {
  markAsRead(): Promise<INotification>;
  markAsUnread(): Promise<INotification>;
}

/**
 * Interface cho Notification static methods
 */
interface INotificationModel extends Model<INotification, {}, INotificationMethods> {
  findByUser(
    userId: string | Types.ObjectId,
    options?: { page?: number; limit?: number; unreadOnly?: boolean }
  ): Promise<INotification[]>;
  
  countUnreadByUser(userId: string | Types.ObjectId): Promise<number>;
  
  markAllAsReadByUser(userId: string | Types.ObjectId): Promise<void>;
  
  deleteOldNotifications(daysOld: number): Promise<number>;
}

/**
 * Interface cho Notification document
 */
export interface INotification extends MongooseDocument, INotificationMethods {
  user_id: Types.ObjectId;
  title: string;
  content?: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'quiz' | 'grade' | 'announcement' | 'emill' | 'other';
  is_read: boolean;
  link?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Notification Schema Definition
 */
const NotificationSchema = new Schema<INotification, INotificationModel, INotificationMethods>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
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
        values: ['info', 'warning', 'success', 'error', 'assignment','quiz' ,'grade', 'announcement'],
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
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    versionKey: false,
  }
);

// ========================================
// INDEXES
// ========================================

NotificationSchema.index({ user_id: 1 });
NotificationSchema.index({ is_read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ created_at: -1 }); // Sort by newest
// Compound index for efficient queries
NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });


// Virtual để check if notification is new (created within 24 hours)
NotificationSchema.virtual('is_new').get(function (this: INotification) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return this.created_at > oneDayAgo;
});

// Populate user info
NotificationSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// ========================================
// METHODS
// ========================================

// Đánh dấu là đã đọc
NotificationSchema.methods.markAsRead = function (this: INotification) {
  if (this.is_read) {
    return Promise.resolve(this);
  }
  this.is_read = true;
  return this.save();
};

// Đánh dấu là chưa đọc
NotificationSchema.methods.markAsUnread = function (this: INotification) {
  if (!this.is_read) {
    return Promise.resolve(this);
  }
  this.is_read = false;
  return this.save();
};

// ========================================
// STATIC METHODS
// ========================================

// Lấy notifications của user
NotificationSchema.statics.findByUser = function (
  userId: string | Types.ObjectId,
  options?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const unreadOnly = options?.unreadOnly || false;

  const query: any = { user_id: userId };
  if (unreadOnly) {
    query.is_read = false;
  }

  return this.find(query)
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Đếm số notifications chưa đọc
NotificationSchema.statics.countUnreadByUser = function (
  userId: string | Types.ObjectId
) {
  return this.countDocuments({ user_id: userId, is_read: false });
};

// Đánh dấu tất cả là đã đọc
NotificationSchema.statics.markAllAsReadByUser = async function (
  userId: string | Types.ObjectId
) {
  await this.updateMany(
    { user_id: userId, is_read: false },
    { $set: { is_read: true } }
  );
};

// Xóa notifications cũ (hơn X ngày)
NotificationSchema.statics.deleteOldNotifications = async function (
  daysOld: number = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    created_at: { $lt: cutoffDate },
    is_read: true, // Chỉ xóa những cái đã đọc
  });

  return result.deletedCount || 0;
};

// ========================================
// JSON TRANSFORM
// ========================================

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

/**
 * Export Notification Model
 */
export const Notification = model<INotification, INotificationModel>(
  'Notification',
  NotificationSchema
);