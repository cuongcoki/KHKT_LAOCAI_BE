/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho Document instance methods
 */
interface IDocumentMethods {
  incrementDownloadCount(): Promise<IDocument>;
  incrementViewCount(): Promise<IDocument>;
}

/**
 * Interface cho Document static methods
 */
interface IDocumentModel extends Model<IDocument, {}, IDocumentMethods> {
  findBySubject(subjectId: string | Types.ObjectId): Promise<IDocument[]>;
  findByTeacher(teacherId: string | Types.ObjectId): Promise<IDocument[]>;
  findByGradeLevel(gradeLevel: number): Promise<IDocument[]>;
}

/**
 * Interface cho Document document
 */
export interface IDocument extends MongooseDocument, IDocumentMethods {
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  subject_id: Types.ObjectId;
  teacher_id: Types.ObjectId;
  grade_levels: number[];
  tags: string[];
  is_public: boolean;
  download_count: number;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Document Schema Definition
 */
const DocumentSchema = new Schema<IDocument, IDocumentModel, IDocumentMethods>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề tài liệu là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả tối đa 1000 ký tự'],
    },
    file_url: {
      type: String,
      required: [true, 'File URL là bắt buộc'],
      trim: true,
    },
    file_name: {
      type: String,
      required: [true, 'Tên file gốc là bắt buộc'],
      trim: true,
    },
    file_type: {
      type: String,
      required: [true, 'Loại file là bắt buộc'],
      trim: true,
    },
    file_size: {
      type: Number,
      required: [true, 'Kích thước file là bắt buộc'],
      min: [0, 'Kích thước file không hợp lệ'],
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID là bắt buộc'],
    },
    teacher_id: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID là bắt buộc'],
    },
    grade_levels: {
      type: [Number],
      required: [true, 'Khối lớp là bắt buộc'],
      validate: {
        validator: function (levels: number[]) {
          return levels.length > 0 && levels.every((level) => level >= 10 && level <= 12);
        },
        message: 'Khối lớp phải từ 10 đến 12 và không được rỗng',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    is_public: {
      type: Boolean,
      default: true,
    },
    download_count: {
      type: Number,
      default: 0,
      min: [0, 'Download count không hợp lệ'],
    },
    view_count: {
      type: Number,
      default: 0,
      min: [0, 'View count không hợp lệ'],
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
DocumentSchema.index({ subject_id: 1 });
DocumentSchema.index({ teacher_id: 1 });
DocumentSchema.index({ grade_levels: 1 });
DocumentSchema.index({ is_public: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });



DocumentSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subject_id',
  foreignField: '_id',
  justOne: true,
});

DocumentSchema.virtual('teacher', {
  ref: 'Teacher',
  localField: 'teacher_id',
  foreignField: '_id',
  justOne: true,
});

// ========================================
// METHODS
// ========================================
DocumentSchema.methods.incrementDownloadCount = function (this: IDocument) {
  this.download_count += 1;
  return this.save();
};

DocumentSchema.methods.incrementViewCount = function (this: IDocument) {
  this.view_count += 1;
  return this.save();
};

// ========================================
// STATIC METHODS
// ========================================
DocumentSchema.statics.findBySubject = function (subjectId: string | Types.ObjectId) {
  return this.find({ subject_id: subjectId, is_public: true })
    .populate('teacher_id subject_id')
    .sort({ created_at: -1 });
};

DocumentSchema.statics.findByTeacher = function (teacherId: string | Types.ObjectId) {
  return this.find({ teacher_id: teacherId })
    .populate('subject_id')
    .sort({ created_at: -1 });
};

DocumentSchema.statics.findByGradeLevel = function (gradeLevel: number) {
  return this.find({ grade_levels: gradeLevel, is_public: true })
    .populate('teacher_id subject_id')
    .sort({ created_at: -1 });
};

// ========================================
// JSON TRANSFORM
// ========================================
DocumentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

DocumentSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

export const Document = model<IDocument, IDocumentModel>('Document', DocumentSchema);