/**
 * Custom modules
 */
import classService from '../services/classService';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

class ClassController {
  /**
   * Tạo class mới
   */
  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const classDoc = await classService.createClass(data);

      res.status(201).json({
        success: true,
        message: 'Tạo lớp học thành công',
        data: classDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update class
   */
  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const data = req.body;

      const classDoc = await classService.updateClass(classId, data);

      res.json({
        success: true,
        message: 'Cập nhật lớp học thành công',
        data: classDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get class by ID
   */
  async getClassById(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;

      const classDoc = await classService.getClassById(classId);

      res.json({
        success: true,
        message: 'Lấy thông tin lớp học thành công',
        data: classDoc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all classes
   */
  async getAllClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        grade_level: req.query.grade_level ? parseInt(req.query.grade_level as string) : undefined,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        teacher_id: req.query.teacher_id as string,
      };

      const result = await classService.getAllClasses(page, limit, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách lớp học thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get classes by teacher
   */
  async getClassesByTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId } = req.params;

      const classes = await classService.getClassesByTeacher(teacherId);

      res.json({
        success: true,
        message: 'Lấy danh sách lớp của giáo viên thành công',
        data: classes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete class
   */
  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;

      await classService.deleteClass(classId);

      res.json({
        success: true,
        message: 'Xóa lớp học thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ClassController();