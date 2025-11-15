"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.loginValidation = [
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
    errorHandle_1.validate,
];
