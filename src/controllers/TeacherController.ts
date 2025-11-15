/**
 * Custom modules
 */
import { logger } from "@/helpers/winston";
import teacherService from "../services/teacherService";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";

class TeacherController {
  /**
   * Tạo profile giáo viên
   */
  async createProfileTeacher(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.userId;
      const role = req.user?.role;
      const { userIdDiff } = req.params;
      const data = req.body;

      const teacher = await teacherService.createProfile(userId!, data, userIdDiff!,role!);

      res.status(201).json({
        success: true,
        message: "Tạo profile giáo viên thành công",
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile giáo viên
   */
  async updateProfileTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const data = req.body;

      const teacher = await teacherService.updateProfile(userId!, data);

      res.json({
        success: true,
        message: "Cập nhật profile giáo viên thành công",
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile giáo viên
   */
  async getProfileTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const teacher = await teacherService.getProfileByUserId(userId!);

      res.json({
        success: true,
        message: "Lấy profile giáo viên thành công",
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId } = req.params;
      logger.info(teacherId );

      const teacher = await teacherService.getTeacherById(teacherId);

      res.json({
        success: true,
        message: "Lấy thông tin giáo viên thành công",
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all teachers
   */
  async getAllTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await teacherService.getAllTeachers(page, limit);

      res.json({
        success: true,
        message: "Lấy danh sách giáo viên thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search teachers by subject
   */
  async searchBySubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "Subject là bắt buộc",
        });
      }

      const result = await teacherService.searchBySpecialization(
        subject as string,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Tìm kiếm giáo viên thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete teacher profile
   */
  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      await teacherService.deleteProfile(userId!);

      res.json({
        success: true,
        message: "Xóa profile giáo viên thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TeacherController();
