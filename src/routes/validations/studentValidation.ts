import { body } from "express-validator";
import { validate } from "@/utils/errorHandle";

/**
 * Create student profile validation
 */
export const createStudentValidation = [
  body("student_code")
    .trim()
    .notEmpty()
    .withMessage("Mã học sinh là bắt buộc")
    .matches(/^HS[0-9]{4,6}$/)
    .withMessage("Mã học sinh phải có định dạng HS + 4-6 chữ số (VD: HS0001)"),

  body("grade_level")
    .isInt({ min: 10, max: 12 })
    .withMessage("Khối lớp phải từ 10 đến 12"),

  body("current_class")
    .trim()
    .notEmpty()
    .withMessage("Lớp hiện tại là bắt buộc")
    .matches(/^(10|11|12)[A-Z][0-9]{1,2}$/)
    .withMessage("Lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)"),

  body("school_name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tên trường tối đa 200 ký tự"),

  body("learning_style")
    .optional()
    .isIn(["visual", "auditory", "kinesthetic", "reading_writing"])
    .withMessage("Learning style không hợp lệ"),

  body("difficulty_preference")
    .optional()
    .isIn(["easy", "medium", "hard", "mixed"])
    .withMessage("Difficulty preference không hợp lệ"),

  validate,
];

/**
 * Update student profile validation
 */
export const updateStudentValidation = [
  body("grade_level")
    .optional()
    .isInt({ min: 10, max: 12 })
    .withMessage("Khối lớp phải từ 10 đến 12"),

  body("current_class")
    .optional()
    .trim()
    .matches(/^(10|11|12)[A-Z][0-9]{1,2}$/)
    .withMessage("Lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)"),

  body("school_name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tên trường tối đa 200 ký tự"),

  body("learning_style")
    .optional()
    .isIn(["visual", "auditory", "kinesthetic", "reading_writing"])
    .withMessage("Learning style không hợp lệ"),

  body("difficulty_preference")
    .optional()
    .isIn(["easy", "medium", "hard", "mixed"])
    .withMessage("Difficulty preference không hợp lệ"),

  validate,
];