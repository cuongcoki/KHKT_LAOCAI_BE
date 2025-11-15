/**
 * Custom modules
 */
import { logger } from "../helpers/winston";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../utils/errorHandle";

/**
 * Models
 */
import { Teacher } from "../models/Teacher";

/**
 * Types
 */
import type { Types } from "mongoose";
import { User } from "@/models/User";

class TeacherService {
  /**
   * Tạo profile giáo viên
   */
 async createProfile(
  userId: string | Types.ObjectId,
  data: any,
  userIdDiff: string | Types.ObjectId | undefined,
  role: string | undefined,
) {
  // teacher tự tạo profile cho mình
  // admin có thể tạo cho teacher khác
  const targetUserId = role === "teacher" ? userId : userIdDiff;

  if (!targetUserId) {
    throw new BadRequestError("Thiếu userIdDiff để tạo profile giáo viên");
  }

  // Check exist
  const existingTeacher = await Teacher.findOne({ user_id: targetUserId });
  if (existingTeacher) {
    throw new ConflictError("Profile giáo viên đã tồn tại");
  }

  // Check teacher_code
  const existingCode = await Teacher.findOne({ teacher_code: data.teacher_code });
  if (existingCode) {
    throw new ConflictError("Mã giáo viên đã tồn tại");
  }

  const teacher = await Teacher.create({
    user_id: targetUserId,
    ...data
  });

  await teacher.populate("user_id", "username email full_name");

  logger.info(`Teacher profile created: ${teacher.teacher_code}`);

  return teacher;
}


  /**
   * Update profile giáo viên
   */
  async updateProfile(userId: string | Types.ObjectId, data: any) {
    // Find teacher profile
    const teacher = await Teacher.findOne({ user_id: userId });

    if (!teacher) {
      throw new NotFoundError("Profile giáo viên không tồn tại");
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (teacher as any)[key] = data[key];
      }
    });

    await teacher.save();

    // Populate user info
    await teacher.populate("user_id", "username email full_name");

    logger.info(`Teacher profile updated: ${teacher.teacher_code}`);

    return teacher;
  }

  /**
   * Get profile giáo viên by userId
   */
  async getProfileByUserId(userId: string | Types.ObjectId) {
    logger.info(userId);
    const teacher = await Teacher.findOne({ user_id: userId }).populate(
      "user_id",
      "username email full_name avatar phone"
    );
    if (!teacher) {
      throw new NotFoundError("Profile giáo viên không tồn tại");
    }

    return teacher;
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(teacherId: string | Types.ObjectId) {
    logger.info(teacherId);
    const teacher = await User.findById(teacherId)

    const checkRole = await User.findOne({ _id: teacherId, role: 'teacher' })
    if(!checkRole) {
      throw new NotFoundError("Giáo viên không tồn tại");
    }

    if (!teacher) {
      throw new NotFoundError("Giáo viên không tồn tại");
    }

    return teacher;
  }

  /**
   * Get all teachers với pagination
   */
  async getAllTeachers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find()
        .populate("user_id", "username email full_name avatar")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Teacher.countDocuments(),
    ]);

    return {
      teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search teachers by specialization
   */
  async searchBySpecialization(subject: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find({ specialization: subject })
        .populate("user_id", "username email full_name avatar")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Teacher.countDocuments({ specialization: subject }),
    ]);

    return {
      teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete teacher profile
   */
  async deleteProfile(userId: string | Types.ObjectId) {
    const teacher = await Teacher.findOneAndDelete({ user_id: userId });

    if (!teacher) {
      throw new NotFoundError("Profile giáo viên không tồn tại");
    }

    logger.info(`Teacher profile deleted: ${teacher.teacher_code}`);

    return teacher;
  }
}

export default new TeacherService();