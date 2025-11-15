import { body } from 'express-validator';
import { validate } from '@/utils/errorHandle';

/**
 * Create enrollment validation
 */
export const createEnrollmentValidation = [
  body('student_id').trim().notEmpty().withMessage('Student ID là bắt buộc'),

  body('class_id').trim().notEmpty().withMessage('Class ID là bắt buộc'),

  validate,
];

/**
 * Update enrollment validation
 */
export const updateEnrollmentValidation = [
  body('status')
    .optional()
    .isIn(['active', 'completed', 'dropped'])
    .withMessage('Status phải là: active, completed, hoặc dropped'),

  body('grade')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Điểm phải từ 0 đến 10'),

  body('attendance_count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số buổi học phải là số dương'),

  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),

  validate,
];

/**
 * Update grade validation
 */
export const updateGradeValidation = [
  body('grade')
    .notEmpty()
    .withMessage('Điểm là bắt buộc')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Điểm phải từ 0 đến 10'),

  validate,
];