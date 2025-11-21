/**
 * Custom modules
 */
import assignmentService from "../services/assignmentService";
import { getFileType, getRelativePath, deleteFile } from "../middlewares/uploadFile";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";

class AssignmentController {
  /**
   * Tạo assignment mới với upload files
   */
  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Xử lý files được upload
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const attachments = files.map((file) => ({
          filename: file.originalname,
          url: `/upload/${getFileType(file.mimetype)}/${file.filename}`,
          size: file.size,
          type: getFileType(file.mimetype),
        }));
        data.attachments = attachments;
      }

      const assignment = await assignmentService.createAssignment(data);

      res.status(201).json({
        success: true,
        message: "Tạo bài tập thành công",
        data: assignment,
      });
    } catch (error) {
      // Xóa files đã upload nếu có lỗi
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        files.forEach((file) => deleteFile(file.path));
      }
      next(error);
    }
  }

  /**
   * Lấy assignment theo ID
   */
  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;

      const assignment = await assignmentService.getAssignmentById(assignmentId);

      res.json({
        success: true,
        message: "Lấy thông tin bài tập thành công",
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy tất cả assignments
   */
  async getAllAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await assignmentService.getAllAssignments(page, limit);

      res.json({
        success: true,
        message: "Lấy danh sách bài tập thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments theo class
   */
  async getAssignmentsByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await assignmentService.getAssignmentsByClass(
        classId as string,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách bài tập theo lớp thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments theo subject
   */
  async getAssignmentsBySubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await assignmentService.getAssignmentsBySubject(
        subjectId as string,
        page,
        limit
      );

      res.json({
        success: true,
        message: "Lấy danh sách bài tập theo môn học thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments sắp đến hạn
   */
  async getUpcomingAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.query;
      const days = parseInt(req.query.days as string) || 7;

      const assignments = await assignmentService.getUpcomingAssignments(
        classId as string,
        days
      );

      res.json({
        success: true,
        message: "Lấy danh sách bài tập sắp đến hạn thành công",
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy assignments quá hạn
   */
  async getPastDueAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.query;

      const assignments = await assignmentService.getPastDueAssignments(
        classId as string
      );

      res.json({
        success: true,
        message: "Lấy danh sách bài tập quá hạn thành công",
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;
      const data = req.body;

      const assignment = await assignmentService.updateAssignment(
        assignmentId,
        data
      );

      res.json({
        success: true,
        message: "Cập nhật bài tập thành công",
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa assignment
   */
  async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;

      await assignmentService.deleteAssignment(assignmentId);

      res.json({
        success: true,
        message: "Xóa bài tập thành công",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê assignment
   */
  async getAssignmentStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;

      const result = await assignmentService.getAssignmentStatistics(assignmentId);

      res.json({
        success: true,
        message: "Lấy thống kê bài tập thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssignmentController();