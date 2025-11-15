/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Model } from 'mongoose';

/**
 * Interface cho Subject instance methods
 */
interface ISubjectMethods {
  isAvailableForGrade(gradeLevel: number): boolean;
}

/**
 * Interface cho Subject static methods
 */
interface ISubjectModel extends Model<ISubject, {}, ISubjectMethods> {
  findByGradeLevel(gradeLevel: number): Promise<ISubject[]>;
}

/**
 * Interface cho Subject document
 */
export interface ISubject extends MongooseDocument, ISubjectMethods {
  name: string;
  code: string;
  description?: string;
  grade_levels: number[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Subject Schema Definition
 */
const SubjectSchema = new Schema<ISubject, ISubjectModel, ISubjectMethods>(
  {
    name: {
      type: String,
      required: [true, 'Tên môn học là bắt buộc'],
      trim: true,
      unique: true,
      maxlength: [100, 'Tên môn học tối đa 100 ký tự'],
    },
    code: {
      type: String,
      required: [true, 'Mã môn học là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Mã môn học tối đa 20 ký tự'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả tối đa 500 ký tự'],
    },
    grade_levels: {
      type: [Number],
      required: [true, 'Khối lớp là bắt buộc'],
      validate: {
        validator: function (levels: number[]) {
          return (
            levels.length > 0 &&
            levels.every((level) => level >= 10 && level <= 12)
          );
        },
        message: 'Khối lớp phải từ 10 đến 12 và không được rỗng',
      },
    },
    is_active: {
      type: Boolean,
      default: true,
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
SubjectSchema.index({ code: 1 });
SubjectSchema.index({ name: 1 });
SubjectSchema.index({ is_active: 1 });
SubjectSchema.index({ grade_levels: 1 });


// ========================================
// METHODS
// ========================================
SubjectSchema.methods.isAvailableForGrade = function (
  this: ISubject,
  gradeLevel: number
): boolean {
  return this.grade_levels.includes(gradeLevel);
};

// ========================================
// STATIC METHODS
// ========================================
SubjectSchema.statics.findByGradeLevel = function (gradeLevel: number) {
  return this.find({
    grade_levels: gradeLevel,
    is_active: true,
  }).sort({ name: 1 });
};

// ========================================
// JSON TRANSFORM
// ========================================
SubjectSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

SubjectSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

export const Subject = model<ISubject, ISubjectModel>('Subject', SubjectSchema);