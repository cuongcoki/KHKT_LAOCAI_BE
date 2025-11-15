import { body } from "express-validator";
import { validate } from "@/utils/errorHandle";

/**
 * Create teacher profile validation
 */
export const createTeacherValidation = [
  body("teacher_code")
    .trim()
    .notEmpty()
    .withMessage("Mã giáo viên là bắt buộc")
    .matches(/^GV[0-9]{4,6}$/)
    .withMessage("Mã giáo viên phải có định dạng GV + 4-6 chữ số (VD: GV0001)"),

  body("specialization")
    .isArray({ min: 1 })
    .withMessage("Chuyên môn phải là array và có ít nhất 1 môn"),

  body("grade_levels_taught")
    .isArray({ min: 1 })
    .withMessage("Khối lớp phải là array và có ít nhất 1 khối"),

  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Tiểu sử tối đa 500 ký tự"),

  body("school_name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tên trường tối đa 200 ký tự"),

  validate,
];

/**
 * Update teacher profile validation
 */
export const updateTeacherValidation = [
  body("specialization")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Chuyên môn phải là array và có ít nhất 1 môn"),

  body("grade_levels_taught")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Khối lớp phải là array và có ít nhất 1 khối"),

  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Tiểu sử tối đa 500 ký tự"),

  body("school_name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tên trường tối đa 200 ký tự"),

  validate,
];