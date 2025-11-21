"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherValidation = exports.createTeacherValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createTeacherValidation = [
    (0, express_validator_1.body)("teacher_code")
        .trim()
        .notEmpty()
        .withMessage("Mã giáo viên là bắt buộc")
        .matches(/^GV[0-9]{4,6}$/)
        .withMessage("Mã giáo viên phải có định dạng GV + 4-6 chữ số (VD: GV0001)"),
    (0, express_validator_1.body)("specialization")
        .isArray({ min: 1 })
        .withMessage("Chuyên môn phải là array và có ít nhất 1 môn"),
    (0, express_validator_1.body)("grade_levels_taught")
        .isArray({ min: 1 })
        .withMessage("Khối lớp phải là array và có ít nhất 1 khối"),
    (0, express_validator_1.body)("bio").optional().trim().isLength({ max: 500 }).withMessage("Tiểu sử tối đa 500 ký tự"),
    (0, express_validator_1.body)("school_name")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Tên trường tối đa 200 ký tự"),
    errorHandle_1.validate,
];
exports.updateTeacherValidation = [
    (0, express_validator_1.body)("specialization")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Chuyên môn phải là array và có ít nhất 1 môn"),
    (0, express_validator_1.body)("grade_levels_taught")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Khối lớp phải là array và có ít nhất 1 khối"),
    (0, express_validator_1.body)("bio").optional().trim().isLength({ max: 500 }).withMessage("Tiểu sử tối đa 500 ký tự"),
    (0, express_validator_1.body)("school_name")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Tên trường tối đa 200 ký tự"),
    errorHandle_1.validate,
];
