/**
 * Custom modules
 */
import studentAssignmentService from "../services/studentAssignmentService";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";

class StudentAssignmentController {
  /**
   * Tạo student assignment thủ công
   */
  async createStudentAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const studentAssignment =
        await studentAssignmentService.createStudentAssignment(data);

      res.status(201).json({
        success: true,
        message: "Tạo student assignment thành công",
        data: studentAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy student assignment theo ID
   */
  async getStudentAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentAssignmentId } = req.params;

      const studentAssignment =
        await studentAssignmentService.getStudentAssignmentById(studentAssignmentId);

      res.json({
        success: true,
        message: "Lấy thông tin student assignment thành công",
        data: studentAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy tất cả student assignments
   */
  async getAllStudentAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await studentAssignmentService.getAllStudentAssignments(
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách student assignments thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments của một student
   */
  async getAssignmentsByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await studentAssignmentService.getAssignmentsByStudent(
        studentId,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách assignments của student thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments của chính mình (student)
   */
  async getMyAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Cần lấy student_id từ userId
      // Import Student model để lấy student_id
      const { Student } = require("../models/Student");
      const student = await Student.findOne({ user_id: userId });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Profile học sinh không tồn tại",
        });
      }

      const result = await studentAssignmentService.getAssignmentsByStudent(
        student._id,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách assignments của bạn thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy submissions của một assignment
   */
  async getSubmissionsByAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await studentAssignmentService.getSubmissionsByAssignment(
        assignmentId as string,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách submissions thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy bài chưa nộp của student
   */
  async getUnsubmittedByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;

      const studentAssignments =
        await studentAssignmentService.getUnsubmittedByStudent(studentId);

      res.json({
        success: true,
        message: "Lấy danh sách bài chưa nộp thành công",
        data: studentAssignments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy bài chưa nộp của chính mình (student)
   */
  async getMyUnsubmitted(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      // Lấy student_id từ userId
      const { Student } = require("../models/Student");
      const student = await Student.findOne({ user_id: userId });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Profile học sinh không tồn tại",
        });
      }

      const studentAssignments =
        await studentAssignmentService.getUnsubmittedByStudent(student._id);

      res.json({
        success: true,
        message: "Lấy danh sách bài chưa nộp của bạn thành công",
        data: studentAssignments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit assignment
   */
  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentAssignmentId } = req.params;
      const userId = req.user?.userId;
      const submissionData = req.body;

      // Lấy student_id từ userId
      const { Student } = require("../models/Student");
      const student = await Student.findOne({ user_id: userId });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Profile học sinh không tồn tại",
        });
      }

      const studentAssignment = await studentAssignmentService.submitAssignment(
        studentAssignmentId,
        student._id,
        submissionData
      );

      res.json({
        success: true,
        message: "Nộp bài thành công",
        data: studentAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Grade assignment (teacher)
   */
  async gradeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentAssignmentId } = req.params;
      const userId = req.user?.userId;
      const gradeData = req.body;

      // Lấy teacher_id từ userId
      const { Teacher } = require("../models/Teacher");
      const teacher = await Teacher.findOne({ user_id: userId });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Profile giáo viên không tồn tại",
        });
      }

      const studentAssignment = await studentAssignmentService.gradeAssignment(
        studentAssignmentId,
        teacher._id,
        gradeData
      );

      res.json({
        success: true,
        message: "Chấm điểm thành công",
        data: studentAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update student assignment
   */
  async updateStudentAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentAssignmentId } = req.params;
      const data = req.body;

      const studentAssignment =
        await studentAssignmentService.updateStudentAssignment(
          studentAssignmentId,
          data
        );

      res.json({
        success: true,
        message: "Cập nhật student assignment thành công",
        data: studentAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa student assignment
   */
  async deleteStudentAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentAssignmentId } = req.params;

      await studentAssignmentService.deleteStudentAssignment(studentAssignmentId);

      res.json({
        success: true,
        message: "Xóa student assignment thành công",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy bài đã chấm bởi teacher
   */
  async getGradedByTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Lấy teacher_id từ userId
      const { Teacher } = require("../models/Teacher");
      const teacher = await Teacher.findOne({ user_id: userId });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Profile giáo viên không tồn tại",
        });
      }

      const result = await studentAssignmentService.getGradedByTeacher(
        teacher._id,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách bài đã chấm thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentAssignmentController();