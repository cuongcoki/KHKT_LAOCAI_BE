import { body } from 'express-validator';
import { validate } from '@/utils/errorHandle';

/**
 * Login validation
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Password phải có ít nhất 6 ký tự'),

  validate,
];

