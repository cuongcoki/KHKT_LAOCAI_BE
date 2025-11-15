/**
 * Custom modules
 */
import { logger } from '../helpers/winston';
import { NotFoundError, ConflictError } from '../utils/errorHandle';

/**
 * Models
 */
import { Subject } from '../models/Subject';

/**
 * Types
 */
import type { Types } from 'mongoose';

class SubjectService {
  /**
   * Tạo subject mới
   */
  async createSubject(data: any) {
    // Check if subject code already exists
    const existingCode = await Subject.findOne({ code: data.code });
    if (existingCode) {
      throw new ConflictError('Mã môn học đã tồn tại');
    }

    // Check if subject name already exists
    const existingName = await Subject.findOne({ name: data.name });
    if (existingName) {
      throw new ConflictError('Tên môn học đã tồn tại');
    }

    // Create subject
    const subject = await Subject.create(data);

    logger.info(`Subject created: ${subject.code}`);

    return subject;
  }

  /**
   * Update subject
   */
  async updateSubject(subjectId: string | Types.ObjectId, data: any) {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError('Môn học không tồn tại');
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (subject as any)[key] = data[key];
      }
    });

    await subject.save();

    logger.info(`Subject updated: ${subject.code}`);

    return subject;
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(subjectId: string | Types.ObjectId) {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError('Môn học không tồn tại');
    }

    return subject;
  }

  /**
   * Get all subjects với pagination
   */
  async getAllSubjects(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }
    if (filters.grade_level) {
      query.grade_levels = filters.grade_level;
    }

    const [subjects, total] = await Promise.all([
      Subject.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Subject.countDocuments(query),
    ]);

    return {
      subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get subjects by grade level
   */
  async getSubjectsByGradeLevel(gradeLevel: number) {
    const subjects = await Subject.findByGradeLevel(gradeLevel);
    return subjects;
  }

  /**
   * Delete subject
   */
  async deleteSubject(subjectId: string | Types.ObjectId) {
    const subject = await Subject.findByIdAndDelete(subjectId);

    if (!subject) {
      throw new NotFoundError('Môn học không tồn tại');
    }

    logger.info(`Subject deleted: ${subject.code}`);

    return subject;
  }
}

export default new SubjectService();