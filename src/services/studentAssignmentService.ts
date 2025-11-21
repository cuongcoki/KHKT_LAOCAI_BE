/**
 * Custom modules
 */
import { logger } from "../helpers/winston";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errorHandle";

/**
 * Models
 */
import { StudentAssignment, IStudentAssignment } from "../models/StudentAssignment";
import { Assignment } from "../models/Assignment";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";

/**
 * Types
 */
import type { Types } from "mongoose";

class StudentAssignmentService {
  /**
   * Tạo student assignment thủ công (cho trường hợp thêm học sinh sau khi assignment đã tạo)
   */
  async createStudentAssignment(data: Partial<IStudentAssignment>) {
    // Kiểm tra student tồn tại
    const studentExists = await Student.findById(data.student_id);
    if (!studentExists) {
      throw new NotFoundError("Học sinh không tồn tại");
    }

    // Kiểm tra assignment tồn tại
    const assignment = await Assignment.findById(data.assignment_id);
    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    // Kiểm tra đã tồn tại chưa
    const existing = await StudentAssignment.findOne({
      student_id: data.student_id,
      assignment_id: data.assignment_id,
    });

    if (existing) {
      throw new ConflictError("Student assignment đã tồn tại");
    }

    // Tạo student assignment
    const studentAssignment = await StudentAssignment.create({
      student_id: data.student_id,
      assignment_id: data.assignment_id,
      due_date: data.due_date || assignment.due_date,
      status: "not_submitted",
    });

    // Update total_unsubmitted trong assignment
    assignment.total_unsubmitted += 1;
    await assignment.save();

    // Populate thông tin
    await studentAssignment.populate([
      { path: "student_id", select: "student_code user_id" },
      { path: "assignment_id", select: "code title due_date max_score" },
    ]);

    logger.info(`Student assignment created for student: ${data.student_id}`);

    return studentAssignment;
  }

  /**
   * Lấy student assignment theo ID
   */
  async getStudentAssignmentById(studentAssignmentId: string | Types.ObjectId) {
    const studentAssignment = await StudentAssignment.findById(
      studentAssignmentId
    ).populate([
      { path: "student_id", select: "student_code user_id" },
      { path: "assignment_id", select: "code title due_date max_score passing_score" },
      { path: "graded_by", select: "teacher_code user_id" },
    ]);

    if (!studentAssignment) {
      throw new NotFoundError("Student assignment không tồn tại");
    }

    return studentAssignment;
  }

  /**
   * Lấy tất cả student assignments với pagination
   */
  async getAllStudentAssignments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [studentAssignments, total] = await Promise.all([
      StudentAssignment.find()
        .populate([
          { path: "student_id", select: "student_code user_id" },
          { path: "assignment_id", select: "code title due_date max_score" },
          { path: "graded_by", select: "teacher_code user_id" },
        ])
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      StudentAssignment.countDocuments(),
    ]);

    return {
      studentAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy assignments của một student
   */
  async getAssignmentsByStudent(
    studentId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    // Kiểm tra student tồn tại
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      throw new NotFoundError("Học sinh không tồn tại");
    }

    const studentAssignments = await StudentAssignment.findByStudent(studentId, {
      page,
      limit,
    });

    const total = await StudentAssignment.countDocuments({ student_id: studentId });

    return {
      studentAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy submissions của một assignment
   */
  async getSubmissionsByAssignment(
    assignmentId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    // Kiểm tra assignment tồn tại
    const assignmentExists = await Assignment.findById(assignmentId);
    if (!assignmentExists) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    const studentAssignments = await StudentAssignment.findByAssignment(assignmentId, {
      page,
      limit,
    });

    const total = await StudentAssignment.countDocuments({
      assignment_id: assignmentId,
    });

    return {
      studentAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy bài chưa nộp của student
   */
  async getUnsubmittedByStudent(studentId: string | Types.ObjectId) {
    // Kiểm tra student tồn tại
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      throw new NotFoundError("Học sinh không tồn tại");
    }

    const studentAssignments = await StudentAssignment.getUnsubmitted(studentId);

    return studentAssignments;
  }

  /**
   * Submit assignment
   */
  async submitAssignment(
    studentAssignmentId: string | Types.ObjectId,
    studentId: string | Types.ObjectId,
    submissionData: {
      submission_file?: string;
      submission_text?: string;
    }
  ) {
    const studentAssignment = await StudentAssignment.findById(studentAssignmentId);

    if (!studentAssignment) {
      throw new NotFoundError("Student assignment không tồn tại");
    }

    // Kiểm tra student có quyền submit không
    if (studentAssignment.student_id.toString() !== studentId.toString()) {
      throw new ForbiddenError("Bạn không có quyền nộp bài này");
    }

    // Kiểm tra đã submit chưa
    if (studentAssignment.status === "graded") {
      throw new BadRequestError("Không thể nộp lại bài đã được chấm điểm");
    }

    // Update submission data
    if (submissionData.submission_file) {
      studentAssignment.submission_file = submissionData.submission_file;
    }
    if (submissionData.submission_text) {
      studentAssignment.submission_text = submissionData.submission_text;
    }

    // Submit
    await studentAssignment.submit();

    // Populate thông tin
    await studentAssignment.populate([
      { path: "student_id", select: "student_code user_id" },
      { path: "assignment_id", select: "code title due_date max_score" },
    ]);

    logger.info(
      `Assignment submitted: ${studentAssignment.assignment_id} by student: ${studentId}`
    );

    return studentAssignment;
  }

  /**
   * Grade assignment
   */
  async gradeAssignment(
    studentAssignmentId: string | Types.ObjectId,
    teacherId: string | Types.ObjectId,
    gradeData: {
      score: number;
      feedback?: string;
    }
  ) {
    const studentAssignment = await StudentAssignment.findById(studentAssignmentId);

    if (!studentAssignment) {
      throw new NotFoundError("Student assignment không tồn tại");
    }

    // Kiểm tra teacher tồn tại
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new NotFoundError("Giáo viên không tồn tại");
    }

    // Kiểm tra đã submit chưa
    if (studentAssignment.status === "not_submitted") {
      throw new BadRequestError("Không thể chấm điểm bài chưa nộp");
    }

    // Get assignment để check max_score
    const assignment = await Assignment.findById(studentAssignment.assignment_id);
    if (!assignment) {
      throw new NotFoundError("Bài tập không tồn tại");
    }

    // Validate score
    if (gradeData.score > assignment.max_score) {
      throw new BadRequestError(
        `Điểm không được vượt quá điểm tối đa (${assignment.max_score})`
      );
    }

    // Grade
    await studentAssignment.grade(
      gradeData.score,
      gradeData.feedback || "",
      teacher._id as Types.ObjectId
    );

    // Populate thông tin
    await studentAssignment.populate([
      { path: "student_id", select: "student_code user_id" },
      { path: "assignment_id", select: "code title due_date max_score passing_score" },
      { path: "graded_by", select: "teacher_code user_id" },
    ]);

    logger.info(
      `Assignment graded: ${studentAssignment.assignment_id} for student: ${studentAssignment.student_id}`
    );

    return studentAssignment;
  }

  /**
   * Update student assignment
   */
  async updateStudentAssignment(
    studentAssignmentId: string | Types.ObjectId,
    data: Partial<IStudentAssignment>
  ) {
    const studentAssignment = await StudentAssignment.findById(studentAssignmentId);

    if (!studentAssignment) {
      throw new NotFoundError("Student assignment không tồn tại");
    }

    // Không cho phép update student_id, assignment_id
    if (data.student_id || data.assignment_id) {
      throw new BadRequestError(
        "Không thể thay đổi student_id hoặc assignment_id sau khi tạo"
      );
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key as keyof IStudentAssignment] !== undefined) {
        (studentAssignment as any)[key] = data[key as keyof IStudentAssignment];
      }
    });

    await studentAssignment.save();

    // Populate thông tin
    await studentAssignment.populate([
      { path: "student_id", select: "student_code user_id" },
      { path: "assignment_id", select: "code title due_date max_score" },
      { path: "graded_by", select: "teacher_code user_id" },
    ]);

    logger.info(`Student assignment updated: ${studentAssignmentId}`);

    return studentAssignment;
  }

  /**
   * Xóa student assignment
   */
  async deleteStudentAssignment(studentAssignmentId: string | Types.ObjectId) {
    const studentAssignment = await StudentAssignment.findById(studentAssignmentId);

    if (!studentAssignment) {
      throw new NotFoundError("Student assignment không tồn tại");
    }

    // Nếu đã submit, giảm total_submitted trong assignment
    if (
      studentAssignment.status === "submitted" ||
      studentAssignment.status === "late" ||
      studentAssignment.status === "graded"
    ) {
      await Assignment.findByIdAndUpdate(studentAssignment.assignment_id, {
        $inc: { total_submitted: -1 },
      });
    } else {
      // Nếu chưa submit, giảm total_unsubmitted
      await Assignment.findByIdAndUpdate(studentAssignment.assignment_id, {
        $inc: { total_unsubmitted: -1 },
      });
    }

    await studentAssignment.deleteOne();

    logger.info(`Student assignment deleted: ${studentAssignmentId}`);

    return studentAssignment;
  }

  /**
   * Lấy bài đã chấm bởi teacher
   */
  async getGradedByTeacher(
    teacherId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    // Kiểm tra teacher tồn tại
    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      throw new NotFoundError("Giáo viên không tồn tại");
    }

    const skip = (page - 1) * limit;

    const [studentAssignments, total] = await Promise.all([
      StudentAssignment.find({ graded_by: teacherId })
        .populate([
          { path: "student_id", select: "student_code user_id" },
          { path: "assignment_id", select: "code title due_date max_score" },
        ])
        .sort({ graded_at: -1 })
        .skip(skip)
        .limit(limit),
      StudentAssignment.countDocuments({ graded_by: teacherId }),
    ]);

    return {
      studentAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new StudentAssignmentService();
