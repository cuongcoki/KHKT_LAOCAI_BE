/**
 * Node modules
 */
import { body, param, query } from "express-validator";

/**
 * Validation cho tạo assignment
 */
export const createAssignmentValidation = [
  body("class_id")
    .notEmpty()
    .withMessage("Class ID là bắt buộc")
    .isMongoId()
    .withMessage("Class ID không hợp lệ"),

  body("code")
    .notEmpty()
    .withMessage("Mã bài tập là bắt buộc")
    .isString()
    .withMessage("Mã bài tập phải là chuỗi")
    .trim()
    .isLength({ min: 6, max: 8 })
    .withMessage("Mã bài tập phải có từ 6-8 ký tự")
    .matches(/^BT[0-9]{4,6}$/)
    .withMessage("Mã bài tập phải có định dạng BT + 4-6 chữ số (VD: BT0001)"),

  body("title")
    .notEmpty()
    .withMessage("Tiêu đề bài tập là bắt buộc")
    .isString()
    .withMessage("Tiêu đề phải là chuỗi")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tiêu đề tối đa 200 ký tự"),

  body("description")
    .optional()
    .isString()
    .withMessage("Mô tả phải là chuỗi")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Mô tả tối đa 5000 ký tự"),

  body("subject_id")
    .notEmpty()
    .withMessage("Subject ID là bắt buộc")
    .isMongoId()
    .withMessage("Subject ID không hợp lệ"),

  body("due_date")
    .notEmpty()
    .withMessage("Hạn nộp là bắt buộc")
    .isISO8601()
    .withMessage("Hạn nộp phải là định dạng ngày hợp lệ")
    .custom((value) => {
      const dueDate = new Date(value);
      const now = new Date();
      if (dueDate <= now) {
        throw new Error("Hạn nộp phải sau thời điểm hiện tại");
      }
      return true;
    }),

  body("max_score")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Điểm tối đa phải từ 0-100"),

  body("passing_score")
    .notEmpty()
    .withMessage("Điểm đạt là bắt buộc")
    .isFloat({ min: 0 })
    .withMessage("Điểm đạt phải lớn hơn hoặc bằng 0")
    .custom((value, { req }) => {
      const maxScore = req.body.max_score || 10;
      if (value > maxScore) {
        throw new Error("Điểm đạt không được vượt quá điểm tối đa");
      }
      return true;
    }),

  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments phải là mảng")
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error("Không được đính kèm quá 10 files");
      }
      return true;
    }),

  body("attachments.*.filename")
    .optional()
    .isString()
    .withMessage("Tên file phải là chuỗi"),

  body("attachments.*.url")
    .optional()
    .isString()
    .withMessage("URL phải là chuỗi"),

  body("attachments.*.size")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Kích thước file phải >= 0"),

  body("attachments.*.type")
    .optional()
    .isString()
    .withMessage("Loại file phải là chuỗi"),

  body("auto_grade_enabled")
    .optional()
    .isBoolean()
    .withMessage("Auto grade enabled phải là boolean"),
];

/**
 * Validation cho update assignment
 */
export const updateAssignmentValidation = [
  body("title")
    .optional()
    .isString()
    .withMessage("Tiêu đề phải là chuỗi")
    .trim()
    .isLength({ max: 200 })
    .withMessage("Tiêu đề tối đa 200 ký tự"),

  body("description")
    .optional()
    .isString()
    .withMessage("Mô tả phải là chuỗi")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Mô tả tối đa 5000 ký tự"),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Hạn nộp phải là định dạng ngày hợp lệ"),

  body("max_score")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Điểm tối đa phải từ 0-100"),

  body("passing_score")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Điểm đạt phải lớn hơn hoặc bằng 0"),

  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments phải là mảng")
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error("Không được đính kèm quá 10 files");
      }
      return true;
    }),

  body("auto_grade_enabled")
    .optional()
    .isBoolean()
    .withMessage("Auto grade enabled phải là boolean"),
];

/**
 * Validation cho assignmentId param
 */
export const assignmentIdValidation = [
  param("assignmentId")
    .notEmpty()
    .withMessage("Assignment ID là bắt buộc")
    .isMongoId()
    .withMessage("Assignment ID không hợp lệ"),
];

/**
 * Validation cho classId query
 */
export const classIdQueryValidation = [
  query("classId")
    .notEmpty()
    .withMessage("Class ID là bắt buộc")
    .isMongoId()
    .withMessage("Class ID không hợp lệ"),
];

/**
 * Validation cho subjectId query
 */
export const subjectIdQueryValidation = [
  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID là bắt buộc")
    .isMongoId()
    .withMessage("Subject ID không hợp lệ"),
];