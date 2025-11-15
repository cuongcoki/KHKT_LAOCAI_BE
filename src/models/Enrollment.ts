/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho Enrollment instance methods
 */
interface IEnrollmentMethods {
  complete(): Promise<IEnrollment>;
  drop(): Promise<IEnrollment>;
  updateGrade(grade: number): Promise<IEnrollment>;
}

/**
 * Interface cho Enrollment static methods
 */
interface IEnrollmentModel extends Model<IEnrollment, {}, IEnrollmentMethods> {
  findByStudent(studentId: string | Types.ObjectId): Promise<IEnrollment[]>;
  findByClass(classId: string | Types.ObjectId): Promise<IEnrollment[]>;
  findActiveByStudent(studentId: string | Types.ObjectId): Promise<IEnrollment[]>;
}

/**
 * Interface cho Enrollment document
 */
export interface IEnrollment extends MongooseDocument, IEnrollmentMethods {
  student_id: Types.ObjectId;
  class_id: Types.ObjectId;
  enrollment_date: Date;
  status: 'active' | 'completed' | 'dropped';
  grade?: number;
  attendance_count: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Enrollment Schema Definition
 */
const EnrollmentSchema = new Schema<IEnrollment, IEnrollmentModel, IEnrollmentMethods>(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID là bắt buộc'],
    },
    class_id: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID là bắt buộc'],
    },
    enrollment_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'dropped'],
        message: 'Status phải là: active, completed, hoặc dropped',
      },
      default: 'active',
    },
    grade: {
      type: Number,
      min: [0, 'Điểm phải từ 0 đến 10'],
      max: [10, 'Điểm phải từ 0 đến 10'],
    },
    attendance_count: {
      type: Number,
      default: 0,
      min: [0, 'Số buổi học không hợp lệ'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú tối đa 500 ký tự'],
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
EnrollmentSchema.index({ student_id: 1, class_id: 1 }, { unique: true });
EnrollmentSchema.index({ student_id: 1 });
EnrollmentSchema.index({ class_id: 1 });
EnrollmentSchema.index({ status: 1 });


EnrollmentSchema.virtual('student', {
  ref: 'Student',
  localField: 'student_id',
  foreignField: '_id',
  justOne: true,
});

EnrollmentSchema.virtual('class', {
  ref: 'Class',
  localField: 'class_id',
  foreignField: '_id',
  justOne: true,
});

// ========================================
// METHODS
// ========================================
EnrollmentSchema.methods.complete = function (this: IEnrollment) {
  this.status = 'completed';
  return this.save();
};

EnrollmentSchema.methods.drop = function (this: IEnrollment) {
  this.status = 'dropped';
  return this.save();
};

EnrollmentSchema.methods.updateGrade = function (this: IEnrollment, grade: number) {
  if (grade < 0 || grade > 10) {
    throw new Error('Điểm phải từ 0 đến 10');
  }
  this.grade = grade;
  return this.save();
};

// ========================================
// STATIC METHODS
// ========================================
EnrollmentSchema.statics.findByStudent = function (studentId: string | Types.ObjectId) {
  return this.find({ student_id: studentId })
    .populate('class_id')
    .sort({ created_at: -1 });
};

EnrollmentSchema.statics.findByClass = function (classId: string | Types.ObjectId) {
  return this.find({ class_id: classId })
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'username email full_name avatar phone',
      },
    })
    .sort({ created_at: -1 });
};

EnrollmentSchema.statics.findActiveByStudent = function (studentId: string | Types.ObjectId) {
  return this.find({ student_id: studentId, status: 'active' })
    .populate('class_id')
    .sort({ created_at: -1 });
};

// ========================================
// JSON TRANSFORM
// ========================================
EnrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

EnrollmentSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

export const Enrollment = model<IEnrollment, IEnrollmentModel>(
  'Enrollment',
  EnrollmentSchema
);