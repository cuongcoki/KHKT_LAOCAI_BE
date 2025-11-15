/**
 * Custom modules
 */
import { logger } from '../helpers/winston';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errorHandle';

/**
 * Models
 */
import { Enrollment } from '../models/Enrollment';
import { Class } from '../models/Class';
import { Student } from '../models/Student';

/**
 * Types
 */
import type { Types } from 'mongoose';

class EnrollmentService {
  /**
   * Tạo enrollment mới (student đăng ký lớp)
   */
  async createEnrollment(studentId: string | Types.ObjectId, classId: string | Types.ObjectId) {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Học sinh không tồn tại');
    }

    // Check if class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw new NotFoundError('Lớp học không tồn tại');
    }

    // Check if class is active
    if (!classDoc.is_active) {
      throw new BadRequestError('Lớp học không hoạt động');
    }

    // Check if class is full
    if (classDoc.isFull()) {
      throw new BadRequestError('Lớp học đã đầy');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student_id: studentId,
      class_id: classId,
    });

    if (existingEnrollment) {
      throw new ConflictError('Học sinh đã đăng ký lớp này rồi');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student_id: studentId,
      class_id: classId,
    });

    // Update class student count
    await classDoc.addStudent();

    // Populate
    await enrollment.populate('student_id class_id');

    logger.info(`Enrollment created: Student ${studentId} enrolled in Class ${classId}`);

    return enrollment;
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(enrollmentId: string | Types.ObjectId, data: any) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        (enrollment as any)[key] = data[key];
      }
    });

    await enrollment.save();
    await enrollment.populate('student_id class_id');

    logger.info(`Enrollment updated: ${enrollmentId}`);

    return enrollment;
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(enrollmentId: string | Types.ObjectId) {
    const enrollment = await Enrollment.findById(enrollmentId).populate('student_id class_id');

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    return enrollment;
  }

  /**
   * Get all enrollments với pagination
   */
  async getAllEnrollments(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.student_id) {
      query.student_id = filters.student_id;
    }
    if (filters.class_id) {
      query.class_id = filters.class_id;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('student_id class_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(query),
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get enrollments by student
   */
  async getEnrollmentsByStudent(studentId: string | Types.ObjectId) {
    const enrollments = await Enrollment.findByStudent(studentId);
    return enrollments;
  }

  /**
   * Get enrollments by class
   */
 async getEnrollmentsByClass(classId: string | Types.ObjectId) {
  const enrollments = await Enrollment.find({ class_id: classId })
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'username email full_name avatar phone',
      },
    })
    .populate('class_id')
    .sort({ created_at: -1 });

  return enrollments;
}

  /**
   * Drop enrollment (student rời khỏi lớp)
   */
  async dropEnrollment(enrollmentId: string | Types.ObjectId) {
    const enrollment = await Enrollment.findById(enrollmentId).populate('class_id');

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    if (enrollment.status !== 'active') {
      throw new BadRequestError('Chỉ có thể drop enrollment đang active');
    }

    // Update enrollment status
    await enrollment.drop();

    // Update class student count
    const classDoc = await Class.findById(enrollment.class_id);
    if (classDoc) {
      await classDoc.removeStudent();
    }

    logger.info(`Enrollment dropped: ${enrollmentId}`);

    return enrollment;
  }

  /**
   * Complete enrollment
   */
  async completeEnrollment(enrollmentId: string | Types.ObjectId) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    await enrollment.complete();

    logger.info(`Enrollment completed: ${enrollmentId}`);

    return enrollment;
  }

  /**
   * Update grade
   */
  async updateGrade(enrollmentId: string | Types.ObjectId, grade: number) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    await enrollment.updateGrade(grade);

    logger.info(`Grade updated for enrollment: ${enrollmentId}`);

    return enrollment;
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(enrollmentId: string | Types.ObjectId) {
    const enrollment = await Enrollment.findById(enrollmentId).populate('class_id');

    if (!enrollment) {
      throw new NotFoundError('Enrollment không tồn tại');
    }

    // Update class student count if enrollment is active
    if (enrollment.status === 'active') {
      const classDoc = await Class.findById(enrollment.class_id);
      if (classDoc) {
        await classDoc.removeStudent();
      }
    }

    await Enrollment.findByIdAndDelete(enrollmentId);

    logger.info(`Enrollment deleted: ${enrollmentId}`);

    return enrollment;
  }
}

export default new EnrollmentService();