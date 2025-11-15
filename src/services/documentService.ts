/**
 * Custom modules
 */
import { logger } from '../helpers/winston';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errorHandle';

/**
 * Models
 */
import { Document } from '../models/Document';

/**
 * Types
 */
import type { Types } from 'mongoose';

class DocumentService {
  /**
   * Tạo document mới
   */
  async createDocument(data: any) {
    const document = await Document.create(data);

    await document.populate('teacher_id subject_id');

    logger.info(`Document created: ${document.title}`);

    return document;
  }

  /**
   * Update document
   */
  async updateDocument(
    documentId: string | Types.ObjectId,
    userId: string,
    userRole: string,
    data: any
  ) {
    const document = await Document.findById(documentId).populate('teacher_id');

    if (!document) {
      throw new NotFoundError('Tài liệu không tồn tại');
    }

    // Check quyền: chỉ teacher tạo hoặc admin mới được update
    if (userRole !== 'admin' && (document.teacher_id as any).user_id.toString() !== userId) {
      throw new ForbiddenError('Bạn không có quyền cập nhật tài liệu này');
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (document as any)[key] = data[key];
      }
    });

    await document.save();
    await document.populate('teacher_id subject_id');

    logger.info(`Document updated: ${document.title}`);

    return document;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string | Types.ObjectId) {
    const document = await Document.findById(documentId).populate('teacher_id subject_id');

    if (!document) {
      throw new NotFoundError('Tài liệu không tồn tại');
    }

    // Increment view count
    await document.incrementViewCount();

    return document;
  }

  /**
   * Get all documents với pagination
   */
  async getAllDocuments(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.subject_id) {
      query.subject_id = filters.subject_id;
    }
    if (filters.teacher_id) {
      query.teacher_id = filters.teacher_id;
    }
    if (filters.grade_level) {
      query.grade_levels = filters.grade_level;
    }
    if (filters.file_type) {
      query.file_type = filters.file_type;
    }
    if (filters.is_public !== undefined) {
      query.is_public = filters.is_public;
    } else {
      // Mặc định chỉ lấy public documents
      query.is_public = true;
    }

    // Search by text
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('teacher_id subject_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get documents by subject
   */
  async getDocumentsBySubject(subjectId: string | Types.ObjectId) {
    const documents = await Document.findBySubject(subjectId);
    return documents;
  }

  /**
   * Get documents by teacher
   */
  async getDocumentsByTeacher(teacherId: string | Types.ObjectId) {
    const documents = await Document.findByTeacher(teacherId);
    return documents;
  }

  /**
   * Get documents by grade level
   */
  async getDocumentsByGradeLevel(gradeLevel: number) {
    const documents = await Document.findByGradeLevel(gradeLevel);
    return documents;
  }

  /**
   * Download document
   */
  async downloadDocument(documentId: string | Types.ObjectId) {
    const document = await Document.findById(documentId);

    if (!document) {
      throw new NotFoundError('Tài liệu không tồn tại');
    }

    // Increment download count
    await document.incrementDownloadCount();

    return document;
  }

  /**
   * Delete document
   */
  async deleteDocument(
    documentId: string | Types.ObjectId,
    userId: string,
    userRole: string
  ) {
    const document = await Document.findById(documentId).populate('teacher_id');

    if (!document) {
      throw new NotFoundError('Tài liệu không tồn tại');
    }

    // Check quyền: chỉ teacher tạo hoặc admin mới được xóa
    if (userRole !== 'admin' && (document.teacher_id as any).user_id.toString() !== userId) {
      throw new ForbiddenError('Bạn không có quyền xóa tài liệu này');
    }

    await Document.findByIdAndDelete(documentId);

    logger.info(`Document deleted: ${document.title}`);

    return document;
  }
}

export default new DocumentService();