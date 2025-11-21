/**
 * Custom modules
 */
import { logger } from "../helpers/winston";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errorHandle";

/**
 * Models
 */
import { Assignment, IAssignment } from "../models/Assignment";
import { StudentAssignment } from "../models/StudentAssignment";
import { Class } from "../models/Class";
import { Subject } from "../models/Subject";
import { Enrollment } from "../models/Enrollment";

/**
 * Types
 */
import type { Types } from "mongoose";

class AssignmentService {
  /**
   * Tạo assignment mới
   */
  async createAssignment(data: Partial<IAssignment>) {
    // Kiểm tra class tồn tại
    const classExists = await Class.findById(data.class_id);
    if (!classExists) {
      throw new NotFoundError("Lớp học không tồn tại");
    }

    // Kiểm tra subject tồn tại
    const subjectExists = await Subject.findById(data.subject_id);
    if (!subjectExists) {
      throw new NotFoundError("Môn học không tồn tại");
    }

    // Kiểm tra mã bài tập đã tồn tại
    const existingCode = await Assignment.findOne({ code: data.code });
    if (existingCode) {
      throw new ConflictError("Mã bài tập đã tồn tại");
    }

    // Tạo assignment
    const assignment = await Assignment.create(data);

    // Tự động tạo student assignments cho tất cả học sinh trong lớp
    const enrollments = await Enrollment.find({
      class_id: data.class_id,
      status: "active",
    });

    if (enrollments.length > 0) {
      const studentAssignments = enrollments.map((enrollment) => ({
        student_id: enrollment.student_id,
        assignment_id: assignment._id,
        due_date: assignment.due_date,
        status: "not_submitted",
      }));

      await StudentAssignment.insertMany(studentAssignments);

      // Update total_unsubmitted
      assignment.total_unsubmitted = enrollments.length;
      await assignment.save();
    }

    // Populate thông tin
    await assignment.populate([
      { path: "class_id", select: "name code" },
      { path: "subject_id", select: "name code" },
    ]);

    logger.info(`Assignment created: ${assignment.code}`);

    return assignment;
  }

  /**
   * Lấy assignment theo ID
   */
  async getAssignmentById(assignmentId: string | Types.ObjectId) {
    const assignment = await Assignment.findById(assignmentId).populate([
      { path: "class_id", select: "name code" },
      { path: "subject_id", select: "name code" },
    ]);

    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    return assignment;
  }

  /**
   * Lấy tất cả assignments với pagination
   */
  async getAllAssignments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find()
        .populate([
          { path: "class_id", select: "name code" },
          { path: "subject_id", select: "name code" },
        ])
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(),
    ]);

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy assignments theo class
   */
  async getAssignmentsByClass(
    classId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    // Kiểm tra class tồn tại
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new NotFoundError("Lớp học không tồn tại");
    }

    const assignments = await Assignment.findByClass(classId, { page, limit });

    const total = await Assignment.countDocuments({ class_id: classId });

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy assignments theo subject
   */
  async getAssignmentsBySubject(
    subjectId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    // Kiểm tra subject tồn tại
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      throw new NotFoundError("Môn học không tồn tại");
    }

    const assignments = await Assignment.findBySubject(subjectId, { page, limit });

    const total = await Assignment.countDocuments({ subject_id: subjectId });

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy assignments sắp đến hạn
   */
  async getUpcomingAssignments(
    classId: string | Types.ObjectId,
    days: number = 7
  ) {
    // Kiểm tra class tồn tại
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new NotFoundError("Lớp học không tồn tại");
    }

    const assignments = await Assignment.getUpcoming(classId, days);

    return assignments;
  }

  /**
   * Lấy assignments quá hạn
   */
  async getPastDueAssignments(classId: string | Types.ObjectId) {
    // Kiểm tra class tồn tại
    const classExists = await Class.findById(classId);
    if (!classExists) {
      throw new NotFoundError("Lớp học không tồn tại");
    }

    const assignments = await Assignment.getPastDue(classId);

    return assignments;
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    assignmentId: string | Types.ObjectId,
    data: Partial<IAssignment>
  ) {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    // Không cho phép update class_id, subject_id, code sau khi tạo
    if (data.class_id || data.subject_id || data.code) {
      throw new BadRequestError(
        "Không thể thay đổi class_id, subject_id hoặc code sau khi tạo"
      );
    }

    // Nếu update due_date, cập nhật cho tất cả student assignments
    if (data.due_date) {
      await StudentAssignment.updateMany(
        { assignment_id: assignmentId },
        { due_date: data.due_date }
      );
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key as keyof IAssignment] !== undefined) {
        (assignment as any)[key] = data[key as keyof IAssignment];
      }
    });

    await assignment.save();

    // Populate thông tin
    await assignment.populate([
      { path: "class_id", select: "name code" },
      { path: "subject_id", select: "name code" },
    ]);

    logger.info(`Assignment updated: ${assignment.code}`);

    return assignment;
  }

  /**
   * Xóa assignment
   */
  async deleteAssignment(assignmentId: string | Types.ObjectId) {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    // Kiểm tra xem có student submissions chưa
    const submittedCount = await StudentAssignment.countDocuments({
      assignment_id: assignmentId,
      status: { $in: ["submitted", "graded", "late"] },
    });

    if (submittedCount > 0) {
      throw new BadRequestError(
        "Không thể xóa bài tập đã có học sinh nộp bài. Vui lòng xóa tất cả submissions trước."
      );
    }

    // Xóa tất cả student assignments
    await StudentAssignment.deleteMany({ assignment_id: assignmentId });

    // Xóa assignment
    await assignment.deleteOne();

    logger.info(`Assignment deleted: ${assignment.code}`);

    return assignment;
  }

  /**
   * Lấy thống kê assignment
   */
  async getAssignmentStatistics(assignmentId: string | Types.ObjectId) {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    // Lấy tất cả student assignments
    const studentAssignments = await StudentAssignment.find({
      assignment_id: assignmentId,
    });

    const statistics = {
      total_students: studentAssignments.length,
      submitted: studentAssignments.filter(
        (sa) => sa.status === "submitted" || sa.status === "late" || sa.status === "graded"
      ).length,
      not_submitted: studentAssignments.filter((sa) => sa.status === "not_submitted")
        .length,
      graded: studentAssignments.filter((sa) => sa.status === "graded").length,
      late: studentAssignments.filter((sa) => sa.status === "late").length,
      submission_rate: assignment.getSubmissionRate(),
      average_score: await StudentAssignment.calculateAverageScore(assignmentId),
      passed: studentAssignments.filter(
        (sa) => sa.score && sa.score >= assignment.passing_score
      ).length,
      failed: studentAssignments.filter(
        (sa) => sa.score !== null && sa.score !== undefined && sa.score < assignment.passing_score
      ).length,
    };

    return {
      assignment,
      statistics,
    };
  }
}

export default new AssignmentService();
