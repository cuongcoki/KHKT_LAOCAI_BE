"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentValidation = exports.createDocumentValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createDocumentValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Tiêu đề tài liệu là bắt buộc')
        .isLength({ max: 200 })
        .withMessage('Tiêu đề tối đa 200 ký tự'),
    (0, express_validator_1.body)('subject_id').trim().notEmpty().withMessage('Subject ID là bắt buộc'),
    (0, express_validator_1.body)('teacher_id').trim().notEmpty().withMessage('Teacher ID là bắt buộc'),
    (0, express_validator_1.body)('grade_levels')
        .isArray({ min: 1 })
        .withMessage('Khối lớp phải là array và có ít nhất 1 khối')
        .custom((levels) => {
        if (!levels.every((level) => level >= 10 && level <= 12)) {
            throw new Error('Khối lớp phải từ 10 đến 12');
        }
        return true;
    }),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Mô tả tối đa 1000 ký tự'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags phải là array'),
    (0, express_validator_1.body)('is_public').optional().isBoolean().withMessage('is_public phải là boolean'),
    errorHandle_1.validate,
];
exports.updateDocumentValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Tiêu đề không được rỗng')
        .isLength({ max: 200 })
        .withMessage('Tiêu đề tối đa 200 ký tự'),
    (0, express_validator_1.body)('grade_levels')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Khối lớp phải là array và có ít nhất 1 khối')
        .custom((levels) => {
        if (!levels.every((level) => level >= 10 && level <= 12)) {
            throw new Error('Khối lớp phải từ 10 đến 12');
        }
        return true;
    }),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Mô tả tối đa 1000 ký tự'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags phải là array'),
    (0, express_validator_1.body)('is_public').optional().isBoolean().withMessage('is_public phải là boolean'),
    errorHandle_1.validate,
];
