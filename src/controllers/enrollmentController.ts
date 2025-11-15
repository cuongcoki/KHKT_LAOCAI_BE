/**
 * Custom modules
 */
import enrollmentService from '../services/enrollmentService';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

class EnrollmentController {
  /**
   * Tạo enrollment mới
   */
  async createEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { student_id, class_id } = req.body;

      const enrollment = await enrollmentService.createEnrollment(student_id, class_id);

      res.status(201).json({
        success: true,
        message: 'Đăng ký lớp thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;
      const data = req.body;

      const enrollment = await enrollmentService.updateEnrollment(enrollmentId, data);

      res.json({
        success: true,
        message: 'Cập nhật enrollment thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await enrollmentService.getEnrollmentById(enrollmentId);

      res.json({
        success: true,
        message: 'Lấy thông tin enrollment thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all enrollments
   */
  async getAllEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        student_id: req.query.student_id as string,
        class_id: req.query.class_id as string,
        status: req.query.status as string,
      };

      const result = await enrollmentService.getAllEnrollments(page, limit, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách enrollment thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrollments by student
   */
  async getEnrollmentsByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;

      const enrollments = await enrollmentService.getEnrollmentsByStudent(studentId);

      res.json({
        success: true,
        message: 'Lấy danh sách lớp của học sinh thành công',
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrollments by class (THÊM METHOD NÀY!)
   */
  async getEnrollmentsByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;

      const enrollments = await enrollmentService.getEnrollmentsByClass(classId);

      res.json({
        success: true,
        message: 'Lấy danh sách học sinh trong lớp thành công',
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Drop enrollment
   */
  async dropEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await enrollmentService.dropEnrollment(enrollmentId);

      res.json({
        success: true,
        message: 'Rời khỏi lớp thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete enrollment
   */
  async completeEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await enrollmentService.completeEnrollment(enrollmentId);

      res.json({
        success: true,
        message: 'Hoàn thành lớp học thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update grade
   */
  async updateGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;
      const { grade } = req.body;

      const enrollment = await enrollmentService.updateGrade(enrollmentId, grade);

      res.json({
        success: true,
        message: 'Cập nhật điểm thành công',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      await enrollmentService.deleteEnrollment(enrollmentId);

      res.json({
        success: true,
        message: 'Xóa enrollment thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EnrollmentController();