/**
 * Custom modules
 */
import subjectService from '../services/subjectService';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

class SubjectController {
  /**
   * Tạo subject mới
   */
  async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      const subject = await subjectService.createSubject(data);

      res.status(201).json({
        success: true,
        message: 'Tạo môn học thành công',
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subject
   */
  async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      const data = req.body;

      const subject = await subjectService.updateSubject(subjectId, data);

      res.json({
        success: true,
        message: 'Cập nhật môn học thành công',
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;

      const subject = await subjectService.getSubjectById(subjectId);

      res.json({
        success: true,
        message: 'Lấy thông tin môn học thành công',
        data: subject,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all subjects
   */
  async getAllSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        is_active:
          req.query.is_active === 'true'
            ? true
            : req.query.is_active === 'false'
            ? false
            : undefined,
        grade_level: req.query.grade_level
          ? parseInt(req.query.grade_level as string)
          : undefined,
      };

      const result = await subjectService.getAllSubjects(page, limit, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách môn học thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subjects by grade level
   */
  async getSubjectsByGradeLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const gradeLevel = parseInt(req.query.grade_level as string);

      if (!gradeLevel || gradeLevel < 10 || gradeLevel > 12) {
        return res.status(400).json({
          success: false,
          message: 'Grade level phải từ 10 đến 12',
        });
      }

      const subjects = await subjectService.getSubjectsByGradeLevel(gradeLevel);

      res.json({
        success: true,
        message: 'Lấy danh sách môn học theo khối thành công',
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete subject
   */
  async deleteSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;

      await subjectService.deleteSubject(subjectId);

      res.json({
        success: true,
        message: 'Xóa môn học thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SubjectController();