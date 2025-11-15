/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho Attachment
 */
interface IAttachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

/**
 * Interface cho Assignment instance methods
 */
interface IAssignmentMethods {
  incrementSubmitted(): Promise<IAssignment>;
  decrementSubmitted(): Promise<IAssignment>;
  getSubmissionRate(): number;
  isPastDue(): boolean;
  canAutoGrade(): boolean;
}

/**
 * Interface cho Assignment static methods
 */
interface IAssignmentModel extends Model<IAssignment, {}, IAssignmentMethods> {
  findByClass(
    classId: string | Types.ObjectId,
    options?: { page?: number; limit?: number }
  ): Promise<IAssignment[]>;
  
  findBySubject(
    subjectId: string | Types.ObjectId,
    options?: { page?: number; limit?: number }
  ): Promise<IAssignment[]>;
  
  getUpcoming(classId: string | Types.ObjectId, days?: number): Promise<IAssignment[]>;
  
  getPastDue(classId: string | Types.ObjectId): Promise<IAssignment[]>;
}

/**
 * Interface cho Assignment document
 */
export interface IAssignment extends MongooseDocument, IAssignmentMethods {
  class_id: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  subject_id: Types.ObjectId;
  due_date: Date;
  max_score: number;
  total_submitted: number;
  total_unsubmitted: number;
  passing_score: number;
  attachments?: IAttachment[];
  auto_grade_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Attachment Sub-Schema
 */
const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Assignment Schema Definition
 */
const AssignmentSchema = new Schema<IAssignment, IAssignmentModel, IAssignmentMethods>(
  {
    class_id: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID là bắt buộc'],
    },
    code: {
      type: String,
      required: [true, 'Mã bài tập là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^BT[0-9]{4,6}$/,
        'Mã bài tập phải có định dạng BT + 4-6 chữ số (VD: BT0001)',
      ],
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề bài tập là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Mô tả tối đa 5000 ký tự'],
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID là bắt buộc'],
    },
    due_date: {
      type: Date,
      required: [true, 'Hạn nộp là bắt buộc'],
      validate: {
        validator: function (this: IAssignment, value: Date) {
          // Chỉ validate khi tạo mới
          if (this.isNew) {
            return value > new Date();
          }
          return true;
        },
        message: 'Hạn nộp phải sau thời điểm hiện tại',
      },
    },
    max_score: {
      type: Number,
      required: [true, 'Điểm tối đa là bắt buộc'],
      min: [0, 'Điểm tối đa phải lớn hơn 0'],
      max: [100, 'Điểm tối đa không được vượt quá 100'],
      default: 10,
    },
    total_submitted: {
      type: Number,
      default: 0,
      min: [0, 'Số bài đã nộp không hợp lệ'],
    },
    total_unsubmitted: {
      type: Number,
      default: 0,
      min: [0, 'Số bài chưa nộp không hợp lệ'],
    },
    passing_score: {
      type: Number,
      required: [true, 'Điểm đạt là bắt buộc'],
      min: [0, 'Điểm đạt phải lớn hơn hoặc bằng 0'],
      validate: {
        validator: function (this: IAssignment, value: number) {
          return value <= this.max_score;
        },
        message: 'Điểm đạt không được vượt quá điểm tối đa',
      },
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
      validate: {
        validator: function (v: IAttachment[]) {
          return v.length <= 10;
        },
        message: 'Không được đính kèm quá 10 files',
      },
    },
    auto_grade_enabled: {
      type: Boolean,
      default: false,
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

AssignmentSchema.index({ class_id: 1 });
AssignmentSchema.index({ subject_id: 1 });
AssignmentSchema.index({ code: 1 });
AssignmentSchema.index({ due_date: 1 });
AssignmentSchema.index({ created_at: -1 });
AssignmentSchema.index({ title: 'text', description: 'text' }); // Text search



// Virtual để tính tổng số assignments
AssignmentSchema.virtual('total_assignments').get(function (this: IAssignment) {
  return this.total_submitted + this.total_unsubmitted;
});

// Virtual để tính % hoàn thành
AssignmentSchema.virtual('completion_rate').get(function (this: IAssignment) {
  const total = this.total_submitted + this.total_unsubmitted;
  if (total === 0) return 0;
  return Math.round((this.total_submitted / total) * 100);
});

// Virtual để check còn bao nhiêu ngày
AssignmentSchema.virtual('days_until_due').get(function (this: IAssignment) {
  const now = new Date();
  const diff = this.due_date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Populate class info
AssignmentSchema.virtual('class', {
  ref: 'Class',
  localField: 'class_id',
  foreignField: '_id',
  justOne: true,
});

// Populate subject info
AssignmentSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subject_id',
  foreignField: '_id',
  justOne: true,
});

// ========================================
// METHODS
// ========================================

// Tăng số bài đã nộp
AssignmentSchema.methods.incrementSubmitted = function (this: IAssignment) {
  this.total_submitted += 1;
  if (this.total_unsubmitted > 0) {
    this.total_unsubmitted -= 1;
  }
  return this.save();
};

// Giảm số bài đã nộp (khi student rút bài nộp)
AssignmentSchema.methods.decrementSubmitted = function (this: IAssignment) {
  if (this.total_submitted > 0) {
    this.total_submitted -= 1;
    this.total_unsubmitted += 1;
  }
  return this.save();
};

// Lấy tỷ lệ nộp bài
AssignmentSchema.methods.getSubmissionRate = function (this: IAssignment): number {
  const total = this.total_submitted + this.total_unsubmitted;
  if (total === 0) return 0;
  return (this.total_submitted / total) * 100;
};

// Check if past due
AssignmentSchema.methods.isPastDue = function (this: IAssignment): boolean {
  return new Date() > this.due_date;
};

// Check if can auto grade
AssignmentSchema.methods.canAutoGrade = function (this: IAssignment): boolean {
  return this.auto_grade_enabled;
};

// ========================================
// STATIC METHODS
// ========================================

// Lấy assignments theo class
AssignmentSchema.statics.findByClass = function (
  classId: string | Types.ObjectId,
  options?: { page?: number; limit?: number }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  return this.find({ class_id: classId })
    .sort({ due_date: 1 }) // Sort by soonest due date
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('subject_id');
};

// Lấy assignments theo subject
AssignmentSchema.statics.findBySubject = function (
  subjectId: string | Types.ObjectId,
  options?: { page?: number; limit?: number }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  return this.find({ subject_id: subjectId })
    .sort({ due_date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('class_id');
};

// Lấy assignments sắp đến hạn
AssignmentSchema.statics.getUpcoming = function (
  classId: string | Types.ObjectId,
  days: number = 7
) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    class_id: classId,
    due_date: { $gte: now, $lte: futureDate },
  }).sort({ due_date: 1 });
};

// Lấy assignments quá hạn
AssignmentSchema.statics.getPastDue = function (classId: string | Types.ObjectId) {
  return this.find({
    class_id: classId,
    due_date: { $lt: new Date() },
  }).sort({ due_date: -1 });
};

// ========================================
// JSON TRANSFORM
// ========================================

AssignmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

AssignmentSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

/**
 * Export Assignment Model
 */
export const Assignment = model<IAssignment, IAssignmentModel>(
  'Assignment',
  AssignmentSchema
);