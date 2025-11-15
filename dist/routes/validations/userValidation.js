"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createUserValidation = [
    (0, express_validator_1.body)('username')
        .trim()
        .notEmpty()
        .withMessage('Username là bắt buộc')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username phải từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username chỉ được chứa chữ cái, số và dấu gạch dưới'),
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty()
        .withMessage('Email là bắt buộc')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty()
        .withMessage('Password là bắt buộc')
        .isLength({ min: 6 })
        .withMessage('Password phải có ít nhất 6 ký tự'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'teacher', 'student'])
        .withMessage('Role phải là admin, teacher hoặc student'),
    (0, express_validator_1.body)('full_name').optional().trim().isLength({ max: 100 }).withMessage('Họ tên tối đa 100 ký tự'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
        .withMessage('Số điện thoại không hợp lệ'),
    errorHandle_1.validate,
];
