"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectIdQueryValidation = exports.classIdQueryValidation = exports.assignmentIdValidation = exports.updateAssignmentValidation = exports.createAssignmentValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssignmentValidation = [
    (0, express_validator_1.body)("class_id")
        .notEmpty()
        .withMessage("Class ID là bắt buộc")
        .isMongoId()
        .withMessage("Class ID không hợp lệ"),
    (0, express_validator_1.body)("code")
        .notEmpty()
        .withMessage("Mã bài tập là bắt buộc")
        .isString()
        .withMessage("Mã bài tập phải là chuỗi")
        .trim()
        .isLength({ min: 6, max: 8 })
        .withMessage("Mã bài tập phải có từ 6-8 ký tự")
        .matches(/^BT[0-9]{4,6}$/)
        .withMessage("Mã bài tập phải có định dạng BT + 4-6 chữ số (VD: BT0001)"),
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Tiêu đề bài tập là bắt buộc")
        .isString()
        .withMessage("Tiêu đề phải là chuỗi")
        .trim()
        .isLength({ max: 200 })
        .withMessage("Tiêu đề tối đa 200 ký tự"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .withMessage("Mô tả phải là chuỗi")
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Mô tả tối đa 5000 ký tự"),
    (0, express_validator_1.body)("subject_id")
        .notEmpty()
        .withMessage("Subject ID là bắt buộc")
        .isMongoId()
        .withMessage("Subject ID không hợp lệ"),
    (0, express_validator_1.body)("due_date")
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
    (0, express_validator_1.body)("max_score")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Điểm tối đa phải từ 0-100"),
    (0, express_validator_1.body)("passing_score")
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
    (0, express_validator_1.body)("attachments")
        .optional()
        .isArray()
        .withMessage("Attachments phải là mảng")
        .custom((value) => {
        if (value && value.length > 10) {
            throw new Error("Không được đính kèm quá 10 files");
        }
        return true;
    }),
    (0, express_validator_1.body)("attachments.*.filename")
        .optional()
        .isString()
        .withMessage("Tên file phải là chuỗi"),
    (0, express_validator_1.body)("attachments.*.url")
        .optional()
        .isString()
        .withMessage("URL phải là chuỗi"),
    (0, express_validator_1.body)("attachments.*.size")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Kích thước file phải >= 0"),
    (0, express_validator_1.body)("attachments.*.type")
        .optional()
        .isString()
        .withMessage("Loại file phải là chuỗi"),
    (0, express_validator_1.body)("auto_grade_enabled")
        .optional()
        .isBoolean()
        .withMessage("Auto grade enabled phải là boolean"),
];
exports.updateAssignmentValidation = [
    (0, express_validator_1.body)("title")
        .optional()
        .isString()
        .withMessage("Tiêu đề phải là chuỗi")
        .trim()
        .isLength({ max: 200 })
        .withMessage("Tiêu đề tối đa 200 ký tự"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .withMessage("Mô tả phải là chuỗi")
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Mô tả tối đa 5000 ký tự"),
    (0, express_validator_1.body)("due_date")
        .optional()
        .isISO8601()
        .withMessage("Hạn nộp phải là định dạng ngày hợp lệ"),
    (0, express_validator_1.body)("max_score")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Điểm tối đa phải từ 0-100"),
    (0, express_validator_1.body)("passing_score")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Điểm đạt phải lớn hơn hoặc bằng 0"),
    (0, express_validator_1.body)("attachments")
        .optional()
        .isArray()
        .withMessage("Attachments phải là mảng")
        .custom((value) => {
        if (value && value.length > 10) {
            throw new Error("Không được đính kèm quá 10 files");
        }
        return true;
    }),
    (0, express_validator_1.body)("auto_grade_enabled")
        .optional()
        .isBoolean()
        .withMessage("Auto grade enabled phải là boolean"),
];
exports.assignmentIdValidation = [
    (0, express_validator_1.param)("assignmentId")
        .notEmpty()
        .withMessage("Assignment ID là bắt buộc")
        .isMongoId()
        .withMessage("Assignment ID không hợp lệ"),
];
exports.classIdQueryValidation = [
    (0, express_validator_1.query)("classId")
        .notEmpty()
        .withMessage("Class ID là bắt buộc")
        .isMongoId()
        .withMessage("Class ID không hợp lệ"),
];
exports.subjectIdQueryValidation = [
    (0, express_validator_1.query)("subjectId")
        .notEmpty()
        .withMessage("Subject ID là bắt buộc")
        .isMongoId()
        .withMessage("Subject ID không hợp lệ"),
];
