/**
 * Node modules
 */
import { Schema, model, Document as MongooseDocument, Types, Model } from 'mongoose';

/**
 * Interface cho Class instance methods
 */
interface IClassMethods {
  addStudent(): Promise<IClass>;
  removeStudent(): Promise<IClass>;
  isFull(): boolean;
}

/**
 * Interface cho Class static methods
 */
interface IClassModel extends Model<IClass, {}, IClassMethods> {
  findByTeacher(teacherId: string | Types.ObjectId): Promise<IClass[]>;
  findByGradeLevel(gradeLevel: number): Promise<IClass[]>;
}

/**
 * Interface cho Class document
 */
export interface IClass extends MongooseDocument, IClassMethods {
  name: string;
  code: string;
  grade_level: number;
  teacher_id: Types.ObjectId;
  subject_ids: Types.ObjectId[];
  max_students: number;
  current_students: number;
  school_year: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Class Schema Definition
 */
const ClassSchema = new Schema<IClass, IClassModel, IClassMethods>(
  {
    name: {
      type: String,
      required: [true, 'Tên lớp là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên lớp tối đa 100 ký tự'],
    },
    code: {
      type: String,
      required: [true, 'Mã lớp là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^(10|11|12)[A-Z][0-9]{1,2}$/,
        'Mã lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)',
      ],
    },
    grade_level: {
      type: Number,
      required: [true, 'Khối lớp là bắt buộc'],
      min: [10, 'Khối lớp phải từ 10 đến 12'],
      max: [12, 'Khối lớp phải từ 10 đến 12'],
    },
    teacher_id: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID là bắt buộc'],
    },
    subject_ids: {
  type: [Schema.Types.ObjectId],
  ref: 'Subject',
  required: [true, 'Subject IDs là bắt buộc'],
  validate: {
    validator: (arr: Types.ObjectId[]) => arr.length > 0,
    message: 'Lớp phải có ít nhất 1 môn học'
  }
},
    max_students: {
      type: Number,
      default: 40,
      min: [1, 'Số học sinh tối đa phải lớn hơn 0'],
      max: [50, 'Số học sinh tối đa không quá 50'],
    },
    current_students: {
      type: Number,
      default: 0,
      min: [0, 'Số học sinh hiện tại không hợp lệ'],
    },
    school_year: {
      type: String,
      required: [true, 'Năm học là bắt buộc'],
      match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (VD: 2024-2025)'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả tối đa 500 ký tự'],
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
ClassSchema.index({ code: 1 });
ClassSchema.index({ teacher_id: 1 });
ClassSchema.index({ subject_ids: 1 });
ClassSchema.index({ grade_level: 1 });
ClassSchema.index({ is_active: 1 });

// ========================================
// VIRTUALS
// ========================================
ClassSchema.virtual('available_slots').get(function (this: IClass) {
  return this.max_students - this.current_students;
});

ClassSchema.virtual('subjects', {
  ref: 'Subject',
  localField: 'subject_ids',
  foreignField: '_id',
  justOne: false,
});

// ========================================
// METHODS
// ========================================
ClassSchema.methods.addStudent = function (this: IClass) {
  if (this.current_students >= this.max_students) {
    throw new Error('Lớp đã đầy');
  }
  this.current_students += 1;
  return this.save();
};

ClassSchema.methods.removeStudent = function (this: IClass) {
  if (this.current_students > 0) {
    this.current_students -= 1;
  }
  return this.save();
};

ClassSchema.methods.isFull = function (this: IClass): boolean {
  return this.current_students >= this.max_students;
};

ClassSchema.methods.addSubject = function (this: IClass, subjectId: Types.ObjectId) {
  if (!this.subject_ids.find(x => x.toString() === subjectId.toString())) {
    this.subject_ids.push(subjectId);
  }
  return this.save();
};

ClassSchema.methods.removeSubject = function (this: IClass, subjectId: Types.ObjectId) {
  this.subject_ids = this.subject_ids.filter(x => x.toString() !== subjectId.toString());
  return this.save();
};

// ========================================
// STATIC METHODS
// ========================================
ClassSchema.statics.findByTeacher = function (teacherId: string | Types.ObjectId) {
  return this.find({ teacher_id: teacherId })
    .populate('subjects _id')
    .sort({ created_at: -1 });
};

ClassSchema.statics.findByGradeLevel = function (gradeLevel: number) {
  return this.find({ grade_level: gradeLevel, is_active: true })
    .populate('teacher_id')
    .populate('subjects')
    .sort({ code: 1 });
};

// ========================================
// JSON TRANSFORM
// ========================================
ClassSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

ClassSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

export const Class = model<IClass, IClassModel>('Class', ClassSchema);