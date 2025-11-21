"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentIdQueryValidation = exports.studentIdValidation = exports.studentAssignmentIdValidation = exports.updateStudentAssignmentValidation = exports.gradeAssignmentValidation = exports.submitAssignmentValidation = exports.createStudentAssignmentValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createStudentAssignmentValidation = [
    (0, express_validator_1.body)("student_id")
        .notEmpty()
        .withMessage("Student ID là bắt buộc")
        .isMongoId()
        .withMessage("Student ID không hợp lệ"),
    (0, express_validator_1.body)("assignment_id")
        .notEmpty()
        .withMessage("Assignment ID là bắt buộc")
        .isMongoId()
        .withMessage("Assignment ID không hợp lệ"),
    (0, express_validator_1.body)("due_date")
        .notEmpty()
        .withMessage("Hạn nộp là bắt buộc")
        .isISO8601()
        .withMessage("Hạn nộp phải là định dạng ngày hợp lệ"),
];
exports.submitAssignmentValidation = [
    (0, express_validator_1.body)("submission_file")
        .optional()
        .isString()
        .withMessage("Submission file phải là chuỗi"),
    (0, express_validator_1.body)("submission_text")
        .optional()
        .isString()
        .withMessage("Submission text phải là chuỗi")
        .isLength({ max: 10000 })
        .withMessage("Nội dung bài làm tối đa 10000 ký tự")
        .custom((value, { req }) => {
        if (!value && !req.body.submission_file) {
            throw new Error("Phải có ít nhất submission_file hoặc submission_text");
        }
        return true;
    }),
];
exports.gradeAssignmentValidation = [
    (0, express_validator_1.body)("score")
        .notEmpty()
        .withMessage("Điểm là bắt buộc")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Điểm phải từ 0-100"),
    (0, express_validator_1.body)("feedback")
        .optional()
        .isString()
        .withMessage("Feedback phải là chuỗi")
        .isLength({ max: 2000 })
        .withMessage("Nhận xét tối đa 2000 ký tự"),
];
exports.updateStudentAssignmentValidation = [
    (0, express_validator_1.body)("submission_file")
        .optional()
        .isString()
        .withMessage("Submission file phải là chuỗi"),
    (0, express_validator_1.body)("submission_text")
        .optional()
        .isString()
        .withMessage("Submission text phải là chuỗi")
        .isLength({ max: 10000 })
        .withMessage("Nội dung bài làm tối đa 10000 ký tự"),
    (0, express_validator_1.body)("score")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Điểm phải từ 0-100"),
    (0, express_validator_1.body)("feedback")
        .optional()
        .isString()
        .withMessage("Feedback phải là chuỗi")
        .isLength({ max: 2000 })
        .withMessage("Nhận xét tối đa 2000 ký tự"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["not_submitted", "submitted", "graded", "late"])
        .withMessage("Status không hợp lệ"),
];
exports.studentAssignmentIdValidation = [
    (0, express_validator_1.param)("studentAssignmentId")
        .notEmpty()
        .withMessage("Student Assignment ID là bắt buộc")
        .isMongoId()
        .withMessage("Student Assignment ID không hợp lệ"),
];
exports.studentIdValidation = [
    (0, express_validator_1.param)("studentId")
        .optional()
        .isMongoId()
        .withMessage("Student ID không hợp lệ"),
];
exports.assignmentIdQueryValidation = [
    (0, express_validator_1.query)("assignmentId")
        .optional()
        .isMongoId()
        .withMessage("Assignment ID không hợp lệ"),
];
