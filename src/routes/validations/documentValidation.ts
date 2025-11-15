import { body } from 'express-validator';
import { validate } from '@/utils/errorHandle';

/**
 * Create document validation
 * Note: file_url, file_type, file_size, file_name được tự động thêm từ multer upload
 */
export const createDocumentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề tài liệu là bắt buộc')
    .isLength({ max: 200 })
    .withMessage('Tiêu đề tối đa 200 ký tự'),

  body('subject_id').trim().notEmpty().withMessage('Subject ID là bắt buộc'),

  body('teacher_id').trim().notEmpty().withMessage('Teacher ID là bắt buộc'),

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
    .isLength({ max: 1000 })
    .withMessage('Mô tả tối đa 1000 ký tự'),

  body('tags').optional().isArray().withMessage('Tags phải là array'),

  body('is_public').optional().isBoolean().withMessage('is_public phải là boolean'),

  validate,
];

/**
 * Update document validation
 */
export const updateDocumentValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề không được rỗng')
    .isLength({ max: 200 })
    .withMessage('Tiêu đề tối đa 200 ký tự'),

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
    .isLength({ max: 1000 })
    .withMessage('Mô tả tối đa 1000 ký tự'),

  body('tags').optional().isArray().withMessage('Tags phải là array'),

  body('is_public').optional().isBoolean().withMessage('is_public phải là boolean'),

  validate,
];