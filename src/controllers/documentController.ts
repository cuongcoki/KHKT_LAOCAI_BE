/**
 * Custom modules
 */
import documentService from '../services/documentService';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

class DocumentController {
  /**
   * Tạo document mới
   */
 async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Lấy thông tin file đã upload
      const file = req.file as Express.Multer.File;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload file',
        });
      }

      // Thêm thông tin file vào data
      const documentData = {
        ...data,
        file_url: `/upload/document/${file.filename}`,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
      };

      const document = await documentService.createDocument(documentData);

      res.status(201).json({
        success: true,
        message: 'Tạo tài liệu thành công',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update document
   */
  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.userId!;
      const userRole = req.user?.role!;
      const data = req.body;

      const document = await documentService.updateDocument(documentId, userId, userRole, data);

      res.json({
        success: true,
        message: 'Cập nhật tài liệu thành công',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      const document = await documentService.getDocumentById(documentId);

      res.json({
        success: true,
        message: 'Lấy thông tin tài liệu thành công',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all documents
   */
  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        subject_id: req.query.subject_id as string,
        teacher_id: req.query.teacher_id as string,
        grade_level: req.query.grade_level ? parseInt(req.query.grade_level as string) : undefined,
        file_type: req.query.file_type as string,
        is_public:
          req.query.is_public === 'true'
            ? true
            : req.query.is_public === 'false'
            ? false
            : undefined,
        search: req.query.search as string,
      };

      const result = await documentService.getAllDocuments(page, limit, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách tài liệu thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get documents by subject
   */
  async getDocumentsBySubject(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;

      const documents = await documentService.getDocumentsBySubject(subjectId);

      res.json({
        success: true,
        message: 'Lấy tài liệu theo môn học thành công',
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get documents by teacher
   */
  async getDocumentsByTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId } = req.params;

      const documents = await documentService.getDocumentsByTeacher(teacherId);

      res.json({
        success: true,
        message: 'Lấy tài liệu của giáo viên thành công',
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download document
   */
  async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;

      const document = await documentService.downloadDocument(documentId);

      res.json({
        success: true,
        message: 'Download tài liệu thành công',
        data: {
          file_url: document.file_url,
          title: document.title,
          file_type: document.file_type,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.userId!;
      const userRole = req.user?.role!;

      await documentService.deleteDocument(documentId, userId, userRole);

      res.json({
        success: true,
        message: 'Xóa tài liệu thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();