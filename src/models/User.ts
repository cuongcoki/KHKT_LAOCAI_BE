/**
 * Node modules
 */
import { Schema, model, Document } from 'mongoose';

/**
 * Interface cho User document
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  full_name?: string;
  avatar: string;
  phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username phải có ít nhất 3 ký tự'],
      maxlength: [50, 'Username tối đa 50 ký tự'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email tối đa 100 ký tự'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password là bắt buộc'],
      minlength: [6, 'Password phải có ít nhất 6 ký tự'],
      select: false, // Không trả về password trong queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'teacher', 'student'],
        message: '{VALUE} không phải là role hợp lệ',
      },
      default: 'student',
    },
    full_name: {
      type: String,
      trim: true,
      maxlength: [100, 'Họ tên tối đa 100 ký tự'],
    },
    avatar: {
      type: String,
      default:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Số điện thoại không hợp lệ',
      ],
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
    versionKey: false, // Tắt __v field
  }
);



/**
 * Export User Model
 */
export const User = model<IUser>('User', UserSchema);