/**
 * Node modules
 */
import { body, param, query } from "express-validator";

/**
 * Validation cho tạo student assignment
 */
export const createStudentAssignmentValidation = [
  body("student_id")
    .notEmpty()
    .withMessage("Student ID là bắt buộc")
    .isMongoId()
    .withMessage("Student ID không hợp lệ"),

  body("assignment_id")
    .notEmpty()
    .withMessage("Assignment ID là bắt buộc")
    .isMongoId()
    .withMessage("Assignment ID không hợp lệ"),

  body("due_date")
    .notEmpty()
    .withMessage("Hạn nộp là bắt buộc")
    .isISO8601()
    .withMessage("Hạn nộp phải là định dạng ngày hợp lệ"),
];

/**
 * Validation cho submit assignment
 */
export const submitAssignmentValidation = [
  body("submission_file")
    .optional()
    .isString()
    .withMessage("Submission file phải là chuỗi"),

  body("submission_text")
    .optional()
    .isString()
    .withMessage("Submission text phải là chuỗi")
    .isLength({ max: 10000 })
    .withMessage("Nội dung bài làm tối đa 10000 ký tự")
    .custom((value, { req }) => {
      // Ít nhất phải có submission_file hoặc submission_text
      if (!value && !req.body.submission_file) {
        throw new Error("Phải có ít nhất submission_file hoặc submission_text");
      }
      return true;
    }),
];

/**
 * Validation cho grade assignment
 */
export const gradeAssignmentValidation = [
  body("score")
    .notEmpty()
    .withMessage("Điểm là bắt buộc")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Điểm phải từ 0-100"),

  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback phải là chuỗi")
    .isLength({ max: 2000 })
    .withMessage("Nhận xét tối đa 2000 ký tự"),
];

/**
 * Validation cho update student assignment
 */
export const updateStudentAssignmentValidation = [
  body("submission_file")
    .optional()
    .isString()
    .withMessage("Submission file phải là chuỗi"),

  body("submission_text")
    .optional()
    .isString()
    .withMessage("Submission text phải là chuỗi")
    .isLength({ max: 10000 })
    .withMessage("Nội dung bài làm tối đa 10000 ký tự"),

  body("score")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Điểm phải từ 0-100"),

  body("feedback")
    .optional()
    .isString()
    .withMessage("Feedback phải là chuỗi")
    .isLength({ max: 2000 })
    .withMessage("Nhận xét tối đa 2000 ký tự"),

  body("status")
    .optional()
    .isIn(["not_submitted", "submitted", "graded", "late"])
    .withMessage("Status không hợp lệ"),
];

/**
 * Validation cho studentAssignmentId param
 */
export const studentAssignmentIdValidation = [
  param("studentAssignmentId")
    .notEmpty()
    .withMessage("Student Assignment ID là bắt buộc")
    .isMongoId()
    .withMessage("Student Assignment ID không hợp lệ"),
];

/**
 * Validation cho studentId query/param
 */
export const studentIdValidation = [
  param("studentId")
    .optional()
    .isMongoId()
    .withMessage("Student ID không hợp lệ"),
];

/**
 * Validation cho assignmentId query
 */
export const assignmentIdQueryValidation = [
  query("assignmentId")
    .optional()
    .isMongoId()
    .withMessage("Assignment ID không hợp lệ"),
];
