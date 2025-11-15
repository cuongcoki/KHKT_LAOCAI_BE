/**
 * Custom modules
 */
import { logger } from "../helpers/winston";
import { NotFoundError, ConflictError } from "../utils/errorHandle";

/**
 * Models
 */
import { Student } from "../models/Student";

/**
 * Types
 */
import type { Types } from "mongoose";
import { User } from "@/models/User";

class StudentService {
  /**
   * Tạo profile học sinh
   */
  async createProfile(
    userId: string | Types.ObjectId,
    data: any,
    userIdDiff: string | Types.ObjectId,
    role: string | undefined
  ) {
    // nếu là học sinh → tự tạo profile cho mình
    // nếu role khác → tạo bằng userIdDiff
    const targetUserId = role === "student" ? userId : userIdDiff;

    // check role of target user
    const checkRoleStudent = await User.findOne({
      _id: targetUserId,
      role: "student",
    });
    if (!checkRoleStudent) {
      throw new NotFoundError("Học sinh không tồn tại");
    }

    // Check if student profile already exists
    const existingStudent = await Student.findOne({ user_id: targetUserId });
    if (existingStudent) {
      throw new ConflictError("Profile học sinh đã tồn tại");
    }

    // Check if student_code already exists
    const existingCode = await Student.findOne({
      student_code: data.student_code,
    });
    if (existingCode) {
      throw new ConflictError("Mã học sinh đã tồn tại");
    }

    // Create student profile
    const student = await Student.create({
      user_id: targetUserId,
      ...data,
    });

    // Populate user info
    await student.populate("user_id", "username email full_name");

    logger.info(`Student profile created: ${student.student_code}`);

    return student;
  }

  /**
   * Update profile học sinh
   */
  async updateProfile(userId: string | Types.ObjectId, data: any) {
    // Find student profile
    const student = await Student.findOne({ user_id: userId });

    if (!student) {
      throw new NotFoundError("Profile học sinh không tồn tại");
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (student as any)[key] = data[key];
      }
    });

    await student.save();

    // Populate user info
    await student.populate("user_id", "username email full_name");

    logger.info(`Student profile updated: ${student.student_code}`);

    return student;
  }

  /**
   * Get profile học sinh by userId
   */
  async getProfileByUserId(userId: string | Types.ObjectId) {
    const student = await Student.findOne({ user_id: userId }).populate(
      "user_id",
      "username email full_name avatar phone"
    );

    if (!student) {
      throw new NotFoundError("Profile học sinh không tồn tại");
    }

    return student;
  }

  /**
   * Get student by ID
   */
  async getStudentById(studentId: string | Types.ObjectId) {
    const student = await Student.findById(studentId).populate(
      "user_id",
      "username email full_name avatar"
    );

    if (!student) {
      throw new NotFoundError("Học sinh không tồn tại");
    }

    return student;
  }

  /**
   * Get all students với pagination
   */
  async getAllStudents(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find()
        .populate("user_id", "username email full_name avatar")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search students by class
   */
  async searchByClass(className: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find({ current_class: className })
        .populate("user_id", "username email full_name avatar")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments({ current_class: className }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete student profile
   */
  async deleteProfile(userId: string | Types.ObjectId) {
    const student = await Student.findOneAndDelete({ user_id: userId });

    if (!student) {
      throw new NotFoundError("Profile học sinh không tồn tại");
    }

    logger.info(`Student profile deleted: ${student.student_code}`);

    return student;
  }
}

export default new StudentService();
