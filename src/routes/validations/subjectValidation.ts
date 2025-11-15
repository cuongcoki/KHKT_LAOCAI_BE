import { body } from 'express-validator';
import { validate } from '@/utils/errorHandle';

/**
 * Create subject validation
 */
export const createSubjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên môn học là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên môn học tối đa 100 ký tự'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Mã môn học là bắt buộc')
    .isLength({ max: 20 })
    .withMessage('Mã môn học tối đa 20 ký tự')
    .isUppercase()
    .withMessage('Mã môn học phải viết hoa'),

  body('grade_levels')
    .isArray({ min: 1 })
    .withMessage('Khối lớp phải là array và có ít nhất 1 khối')
    .custom((levels: number[]) => {
      if (!levels.every((level) => level >= 10 && level <= 12)) {
        throw new Error('Khối lớp phải từ 10 đến 12');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả tối đa 500 ký tự'),

  validate,
];

/**
 * Update subject validation
 */
export const updateSubjectValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên môn học không được rỗng')
    .isLength({ max: 100 })
    .withMessage('Tên môn học tối đa 100 ký tự'),

  body('grade_levels')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Khối lớp phải là array và có ít nhất 1 khối')
    .custom((levels: number[]) => {
      if (!levels.every((level) => level >= 10 && level <= 12)) {
        throw new Error('Khối lớp phải từ 10 đến 12');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả tối đa 500 ký tự'),

  body('is_active').optional().isBoolean().withMessage('is_active phải là boolean'),

  validate,
];