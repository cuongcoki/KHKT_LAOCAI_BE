"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassValidation = exports.createClassValidation = void 0;
const express_validator_1 = require("express-validator");
const errorHandle_1 = require("../../utils/errorHandle");
exports.createClassValidation = [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Tên lớp là bắt buộc"),
    (0, express_validator_1.body)("code")
        .trim()
        .notEmpty()
        .withMessage("Mã lớp là bắt buộc")
        .matches(/^(10|11|12)[A-Z][0-9]{1,2}$/)
        .withMessage("Mã lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)"),
    (0, express_validator_1.body)("grade_level")
        .isInt({ min: 10, max: 12 })
        .withMessage("Khối lớp phải từ 10 đến 12"),
    (0, express_validator_1.body)("teacher_id").trim().notEmpty().withMessage("Teacher ID là bắt buộc"),
    (0, express_validator_1.body)("subject_ids")
        .isArray({ min: 1 })
        .withMessage("Subject IDs là bắt buộc và phải có ít nhất 1 phần tử"),
    (0, express_validator_1.body)("subject_ids.*")
        .trim()
        .notEmpty()
        .withMessage("Subject ID không được rỗng"),
    (0, express_validator_1.body)("school_year")
        .trim()
        .notEmpty()
        .withMessage("Năm học là bắt buộc")
        .matches(/^\d{4}-\d{4}$/)
        .withMessage("Năm học phải có định dạng YYYY-YYYY (VD: 2024-2025)"),
    (0, express_validator_1.body)("max_students")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Số học sinh tối đa từ 1-50"),
    errorHandle_1.validate,
];
exports.updateClassValidation = [
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Tên lớp không được rỗng"),
    (0, express_validator_1.body)("max_students")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Số học sinh tối đa từ 1-50"),
    (0, express_validator_1.body)("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active phải là boolean"),
    errorHandle_1.validate,
];
