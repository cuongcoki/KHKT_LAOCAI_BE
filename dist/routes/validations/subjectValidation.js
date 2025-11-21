"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectValidation = exports.createSubjectValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createSubjectValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Tên môn học là bắt buộc')
        .isLength({ max: 100 })
        .withMessage('Tên môn học tối đa 100 ký tự'),
    (0, express_validator_1.body)('code')
        .trim()
        .notEmpty()
        .withMessage('Mã môn học là bắt buộc')
        .isLength({ max: 20 })
        .withMessage('Mã môn học tối đa 20 ký tự')
        .isUppercase()
        .withMessage('Mã môn học phải viết hoa'),
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
        .isLength({ max: 500 })
        .withMessage('Mô tả tối đa 500 ký tự'),
    errorHandle_1.validate,
];
exports.updateSubjectValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Tên môn học không được rỗng')
        .isLength({ max: 100 })
        .withMessage('Tên môn học tối đa 100 ký tự'),
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
        .isLength({ max: 500 })
        .withMessage('Mô tả tối đa 500 ký tự'),
    (0, express_validator_1.body)('is_active').optional().isBoolean().withMessage('is_active phải là boolean'),
    errorHandle_1.validate,
];
