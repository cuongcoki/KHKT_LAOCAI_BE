/**
 * Custom modules
 */
import studentService from "../services/studentService";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";

class StudentController {
  /**
   * Tạo profile học sinh
   */
  async createProfileStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      const { userIdDiff } = req.params;
      const data = req.body;

      const student = await studentService.createProfile(userId!, data, userIdDiff!,role);

      res.status(201).json({
        success: true,
        message: "Tạo profile học sinh thành công",
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile học sinh (chính mình)
   */
  async updateProfileStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const data = req.body;

      const student = await studentService.updateProfile(userId!, data);

      res.json({
        success: true,
        message: "Cập nhật profile học sinh thành công",
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile học sinh (chính mình)
   */
  async getProfileStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const student = await studentService.getProfileByUserId(userId!);

      res.json({
        success: true,
        message: "Lấy profile học sinh thành công",
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student by ID (admin/teacher)
   */
  async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;

      const student = await studentService.getStudentById(studentId);

      res.json({
        success: true,
        message: "Lấy thông tin học sinh thành công",
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all students
   */
  async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await studentService.getAllStudents(page, limit);

      res.json({
        success: true,
        message: "Lấy danh sách học sinh thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search students by class
   */
  async searchByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { className } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!className) {
        return res.status(400).json({
          success: false,
          message: "Class name là bắt buộc",
        });
      }

      const result = await studentService.searchByClass(
        className as string,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Tìm kiếm học sinh thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete student profile
   */
  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      await studentService.deleteProfile(userId!);

      res.json({
        success: true,
        message: "Xóa profile học sinh thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();
