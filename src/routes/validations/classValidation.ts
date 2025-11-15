import { body } from "express-validator";
import { validate } from "@/utils/errorHandle";
/**
 * Create class validation
 */
export const createClassValidation = [
  body("name").trim().notEmpty().withMessage("Tên lớp là bắt buộc"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Mã lớp là bắt buộc")
    .matches(/^(10|11|12)[A-Z][0-9]{1,2}$/)
    .withMessage("Mã lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)"),

  body("grade_level")
    .isInt({ min: 10, max: 12 })
    .withMessage("Khối lớp phải từ 10 đến 12"),

  body("teacher_id").trim().notEmpty().withMessage("Teacher ID là bắt buộc"),

  body("subject_ids")
    .isArray({ min: 1 })
    .withMessage("Subject IDs là bắt buộc và phải có ít nhất 1 phần tử"),

  body("subject_ids.*")
    .trim()
    .notEmpty()
    .withMessage("Subject ID không được rỗng"),

  body("school_year")
    .trim()
    .notEmpty()
    .withMessage("Năm học là bắt buộc")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Năm học phải có định dạng YYYY-YYYY (VD: 2024-2025)"),

  body("max_students")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Số học sinh tối đa từ 1-50"),

  validate,
];

/**
 * Update class validation
 */
export const updateClassValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tên lớp không được rỗng"),

  body("max_students")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Số học sinh tối đa từ 1-50"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active phải là boolean"),

  validate,
];
