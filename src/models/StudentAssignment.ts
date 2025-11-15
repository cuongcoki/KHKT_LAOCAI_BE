/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho StudentAssignment instance methods
 */
interface IStudentAssignmentMethods {
  submit(): Promise<IStudentAssignment>;
  grade(score: number, feedback: string, gradedBy: Types.ObjectId): Promise<IStudentAssignment>;
  isSubmitted(): boolean;
  isGraded(): boolean;
  isPassed(): boolean;
  isLate(): boolean;
}

/**
 * Interface cho StudentAssignment static methods
 */
interface IStudentAssignmentModel extends Model<IStudentAssignment, {}, IStudentAssignmentMethods> {
  findByStudent(
    studentId: string | Types.ObjectId,
    options?: { page?: number; limit?: number }
  ): Promise<IStudentAssignment[]>;
  
  findByAssignment(
    assignmentId: string | Types.ObjectId,
    options?: { page?: number; limit?: number }
  ): Promise<IStudentAssignment[]>;
  
  getUnsubmitted(studentId: string | Types.ObjectId): Promise<IStudentAssignment[]>;
  
  getGradedByTeacher(teacherId: string | Types.ObjectId): Promise<IStudentAssignment[]>;
  
  calculateAverageScore(assignmentId: string | Types.ObjectId): Promise<number>;
}

/**
 * Interface cho StudentAssignment document
 */
export interface IStudentAssignment extends MongooseDocument, IStudentAssignmentMethods {
  student_id: Types.ObjectId;
  assignment_id: Types.ObjectId;
  submission_file?: string;
  submission_text?: string;
  submitted_at?: Date;
  due_date: Date;
  score?: number;
  feedback?: string;
  status: 'not_submitted' | 'submitted' | 'graded' | 'late';
  graded_at?: Date;
  graded_by?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

/**
 * StudentAssignment Schema Definition
 */
const StudentAssignmentSchema = new Schema<
  IStudentAssignment,
  IStudentAssignmentModel,
  IStudentAssignmentMethods
>(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID là bắt buộc'],
    },
    assignment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID là bắt buộc'],
    },
    submission_file: {
      type: String,
      trim: true,
    },
    submission_text: {
      type: String,
      trim: true,
      maxlength: [10000, 'Nội dung bài làm tối đa 10000 ký tự'],
    },
    submitted_at: {
      type: Date,
      default: null,
    },
    due_date: {
      type: Date,
      required: [true, 'Hạn nộp là bắt buộc'],
    },
    score: {
      type: Number,
      min: [0, 'Điểm không thể âm'],
      max: [100, 'Điểm không được vượt quá 100'],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Nhận xét tối đa 2000 ký tự'],
    },
    status: {
      type: String,
      enum: {
        values: ['not_submitted', 'submitted', 'graded', 'late'],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'not_submitted',
    },
    graded_at: {
      type: Date,
      default: null,
    },
    graded_by: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
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

StudentAssignmentSchema.index({ student_id: 1 });
StudentAssignmentSchema.index({ assignment_id: 1 });
StudentAssignmentSchema.index({ status: 1 });
StudentAssignmentSchema.index({ submitted_at: -1 });
StudentAssignmentSchema.index({ graded_by: 1 });
// Compound index - đảm bảo 1 student chỉ có 1 submission cho 1 assignment
StudentAssignmentSchema.index({ student_id: 1, assignment_id: 1 }, { unique: true });



// Virtual để check if late
StudentAssignmentSchema.virtual('is_late').get(function (this: IStudentAssignment) {
  if (!this.submitted_at) return false;
  return this.submitted_at > this.due_date;
});

// Virtual để tính số ngày trễ
StudentAssignmentSchema.virtual('days_late').get(function (this: IStudentAssignment) {
  if (!this.submitted_at || this.submitted_at <= this.due_date) return 0;
  const diff = this.submitted_at.getTime() - this.due_date.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Populate student info
StudentAssignmentSchema.virtual('student', {
  ref: 'Student',
  localField: 'student_id',
  foreignField: '_id',
  justOne: true,
});

// Populate assignment info
StudentAssignmentSchema.virtual('assignment', {
  ref: 'Assignment',
  localField: 'assignment_id',
  foreignField: '_id',
  justOne: true,
});

// Populate grader info
StudentAssignmentSchema.virtual('grader', {
  ref: 'Teacher',
  localField: 'graded_by',
  foreignField: '_id',
  justOne: true,
});

// ========================================
// METHODS
// ========================================

// Submit assignment
StudentAssignmentSchema.methods.submit = function (this: IStudentAssignment) {
  if (this.status === 'graded') {
    throw new Error('Không thể nộp lại bài đã được chấm điểm');
  }

  this.submitted_at = new Date();
  
  // Check if late
  if (this.submitted_at > this.due_date) {
    this.status = 'late';
  } else {
    this.status = 'submitted';
  }
  
  return this.save();
};

// Grade assignment
StudentAssignmentSchema.methods.grade = function (
  this: IStudentAssignment,
  score: number,
  feedback: string,
  gradedBy: Types.ObjectId
) {
  if (this.status === 'not_submitted') {
    throw new Error('Không thể chấm điểm bài chưa nộp');
  }

  this.score = score;
  this.feedback = feedback;
  this.graded_at = new Date();
  this.graded_by = gradedBy;
  this.status = 'graded';
  
  return this.save();
};

// Check if submitted
StudentAssignmentSchema.methods.isSubmitted = function (this: IStudentAssignment): boolean {
  return this.status === 'submitted' || this.status === 'graded' || this.status === 'late';
};

// Check if graded
StudentAssignmentSchema.methods.isGraded = function (this: IStudentAssignment): boolean {
  return this.status === 'graded';
};


// Check if late
StudentAssignmentSchema.methods.isLate = function (this: IStudentAssignment): boolean {
  return this.status === 'late';
};

// ========================================
// STATIC METHODS
// ========================================

// Lấy assignments của student
StudentAssignmentSchema.statics.findByStudent = function (
  studentId: string | Types.ObjectId,
  options?: { page?: number; limit?: number }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  return this.find({ student_id: studentId })
    .sort({ due_date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('assignment_id');
};

// Lấy tất cả submissions của assignment
StudentAssignmentSchema.statics.findByAssignment = function (
  assignmentId: string | Types.ObjectId,
  options?: { page?: number; limit?: number }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  return this.find({ assignment_id: assignmentId })
    .sort({ submitted_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('student_id');
};

// Lấy bài chưa nộp của student
StudentAssignmentSchema.statics.getUnsubmitted = function (
  studentId: string | Types.ObjectId
) {
  return this.find({
    student_id: studentId,
    status: 'not_submitted',
  })
    .sort({ due_date: 1 })
    .populate('assignment_id');
};

// Lấy bài đã chấm bởi teacher
StudentAssignmentSchema.statics.getGradedByTeacher = function (
  teacherId: string | Types.ObjectId
) {
  return this.find({ graded_by: teacherId })
    .sort({ graded_at: -1 })
    .populate('student_id')
    .populate('assignment_id');
};

// Tính điểm trung bình của assignment
StudentAssignmentSchema.statics.calculateAverageScore = async function (
  assignmentId: string | Types.ObjectId
) {
  const result = await this.aggregate([
    {
      $match: {
        assignment_id: new Types.ObjectId(assignmentId as string),
        status: 'graded',
        score: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].averageScore * 100) / 100 : 0;
};

// ========================================
// HOOKS/MIDDLEWARE
// ========================================

// Auto update assignment counts khi submit
StudentAssignmentSchema.post('save', async function (doc: IStudentAssignment) {
  if (doc.status === 'submitted' || doc.status === 'late') {
    const Assignment = model('Assignment');
    await Assignment.findByIdAndUpdate(doc.assignment_id, {
      $inc: { total_submitted: 1, total_unsubmitted: -1 },
    });
  }
});

// ========================================
// JSON TRANSFORM
// ========================================

StudentAssignmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

StudentAssignmentSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

/**
 * Export StudentAssignment Model
 */
export const StudentAssignment = model<IStudentAssignment, IStudentAssignmentModel>(
  'StudentAssignment',
  StudentAssignmentSchema
);