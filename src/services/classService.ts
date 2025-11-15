/**
 * Custom modules
 */
import { logger } from '../helpers/winston';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errorHandle';

/**
 * Models
 */
import { Class } from '../models/Class';

/**
 * Types
 */
import type { Types } from 'mongoose';

class ClassService {
  /**
   * Tạo class mới
   */
  async createClass(data: any) {
    // Check if class code already exists
    const existingCode = await Class.findOne({ code: data.code });
    if (existingCode) {
      throw new ConflictError('Mã lớp đã tồn tại');
    }

    // Create class
    const classDoc = await Class.create(data);

    // Populate
    await classDoc.populate('teacher_id subject_ids');

    logger.info(`Class created: ${classDoc.code}`);

    return classDoc;
  }

  /**
   * Update class
   */
  async updateClass(classId: string | Types.ObjectId, data: any) {
    const classDoc = await Class.findById(classId);

    if (!classDoc) {
      throw new NotFoundError('Lớp học không tồn tại');
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (classDoc as any)[key] = data[key];
      }
    });

    await classDoc.save();
    await classDoc.populate('teacher_id subject_id');

    logger.info(`Class updated: ${classDoc.code}`);

    return classDoc;
  }

  /**
   * Get class by ID
   */
  async getClassById(classId: string | Types.ObjectId) {
    const classDoc = await Class.findById(classId).populate('teacher_id subject_id');

    if (!classDoc) {
      throw new NotFoundError('Lớp học không tồn tại');
    }

    return classDoc;
  }

  /**
   * Get all classes với pagination
   */
  async getAllClasses(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.grade_level) {
      query.grade_level = filters.grade_level;
    }
    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active;
    }
    if (filters.teacher_id) {
      query.teacher_id = filters.teacher_id;
    }

    const [classes, total] = await Promise.all([
      Class.find(query)
        .populate('teacher_id subject_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Class.countDocuments(query),
    ]);

    return {
      classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get classes by teacher
   */
  async getClassesByTeacher(teacherId: string | Types.ObjectId) {
    const classes = await Class.findByTeacher(teacherId);
    return classes;
  }

  /**
   * Get classes by grade level
   */
  async getClassesByGradeLevel(gradeLevel: number) {
    const classes = await Class.findByGradeLevel(gradeLevel);
    return classes;
  }

  /**
   * Delete class
   */
  async deleteClass(classId: string | Types.ObjectId) {
    const classDoc = await Class.findByIdAndDelete(classId);

    if (!classDoc) {
      throw new NotFoundError('Lớp học không tồn tại');
    }

    logger.info(`Class deleted: ${classDoc.code}`);

    return classDoc;
  }
}

export default new ClassService();