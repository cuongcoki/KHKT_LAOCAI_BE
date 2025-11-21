"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGradeValidation = exports.updateEnrollmentValidation = exports.createEnrollmentValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createEnrollmentValidation = [
    (0, express_validator_1.body)('student_id').trim().notEmpty().withMessage('Student ID là bắt buộc'),
    (0, express_validator_1.body)('class_id').trim().notEmpty().withMessage('Class ID là bắt buộc'),
    errorHandle_1.validate,
];
exports.updateEnrollmentValidation = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'completed', 'dropped'])
        .withMessage('Status phải là: active, completed, hoặc dropped'),
    (0, express_validator_1.body)('grade')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('Điểm phải từ 0 đến 10'),
    (0, express_validator_1.body)('attendance_count')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Số buổi học phải là số dương'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),
    errorHandle_1.validate,
];
exports.updateGradeValidation = [
    (0, express_validator_1.body)('grade')
        .notEmpty()
        .withMessage('Điểm là bắt buộc')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Điểm phải từ 0 đến 10'),
    errorHandle_1.validate,
];
