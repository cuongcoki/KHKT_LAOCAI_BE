/**
 * Node modules
 */
import { Schema, model, Document, Types } from 'mongoose';

/**
 * Interface cho Student document
 */
export interface IStudent extends Document {
  user_id: Types.ObjectId;
  student_code: string;
  avatar?: string;
  grade_level: number;
  current_class: string;
  school_name?: string;
  learning_style?: string;
  difficulty_preference?: string;
  last_active?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Student Schema Definition
 */
const StudentSchema = new Schema<IStudent>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID là bắt buộc'],
      unique: true,
    },
    student_code: {
      type: String,
      required: [true, 'Mã học sinh là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^HS[0-9]{4,6}$/,
        'Mã học sinh phải có định dạng HS + 4-6 chữ số (VD: HS0001)',
      ],
    },
    avatar: {
      type: String,
      default:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    grade_level: {
      type: Number,
      required: [true, 'Khối lớp là bắt buộc'],
      min: [10, 'Khối lớp phải từ 10 đến 12'],
      max: [12, 'Khối lớp phải từ 10 đến 12'],
    },
    current_class: {
      type: String,
      required: [true, 'Lớp hiện tại là bắt buộc'],
      trim: true,
      uppercase: true,
      match: [
        /^(10|11|12)[A-Z][0-9]{1,2}$/,
        'Lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1, 11B2)',
      ],
    },
    school_name: {
      type: String,
      trim: true,
      maxlength: [200, 'Tên trường tối đa 200 ký tự'],
    },
    learning_style: {
      type: String,
      enum: {
        values: ['visual', 'auditory', 'kinesthetic', 'reading_writing'],
        message: '{VALUE} không phải là phong cách học hợp lệ',
      },
      default: 'visual',
    },
    difficulty_preference: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard', 'mixed'],
        message: '{VALUE} không phải là mức độ hợp lệ',
      },
      default: 'medium',
    },
    last_active: {
      type: Date,
      default: Date.now,
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



/**
 * Export Student Model
 */
export const Student = model<IStudent>('Student', StudentSchema);