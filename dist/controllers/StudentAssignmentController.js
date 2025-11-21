"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const studentAssignmentService_1 = __importDefault(require("../services/studentAssignmentService"));
class StudentAssignmentController {
    createStudentAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const studentAssignment = yield studentAssignmentService_1.default.createStudentAssignment(data);
                res.status(201).json({
                    success: true,
                    message: "Tạo student assignment thành công",
                    data: studentAssignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStudentAssignmentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentAssignmentId } = req.params;
                const studentAssignment = yield studentAssignmentService_1.default.getStudentAssignmentById(studentAssignmentId);
                res.json({
                    success: true,
                    message: "Lấy thông tin student assignment thành công",
                    data: studentAssignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllStudentAssignments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield studentAssignmentService_1.default.getAllStudentAssignments(page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách student assignments thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAssignmentsByStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield studentAssignmentService_1.default.getAssignmentsByStudent(studentId, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách assignments của student thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getMyAssignments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const { Student } = require("../models/Student");
                const student = yield Student.findOne({ user_id: userId });
                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: "Profile học sinh không tồn tại",
                    });
                }
                const result = yield studentAssignmentService_1.default.getAssignmentsByStudent(student._id, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách assignments của bạn thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSubmissionsByAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assignmentId } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield studentAssignmentService_1.default.getSubmissionsByAssignment(assignmentId, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách submissions thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUnsubmittedByStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const studentAssignments = yield studentAssignmentService_1.default.getUnsubmittedByStudent(studentId);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài chưa nộp thành công",
                    data: studentAssignments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getMyUnsubmitted(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { Student } = require("../models/Student");
                const student = yield Student.findOne({ user_id: userId });
                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: "Profile học sinh không tồn tại",
                    });
                }
                const studentAssignments = yield studentAssignmentService_1.default.getUnsubmittedByStudent(student._id);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài chưa nộp của bạn thành công",
                    data: studentAssignments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    submitAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { studentAssignmentId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const submissionData = req.body;
                const { Student } = require("../models/Student");
                const student = yield Student.findOne({ user_id: userId });
                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: "Profile học sinh không tồn tại",
                    });
                }
                const studentAssignment = yield studentAssignmentService_1.default.submitAssignment(studentAssignmentId, student._id, submissionData);
                res.json({
                    success: true,
                    message: "Nộp bài thành công",
                    data: studentAssignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    gradeAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { studentAssignmentId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const gradeData = req.body;
                const { Teacher } = require("../models/Teacher");
                const teacher = yield Teacher.findOne({ user_id: userId });
                if (!teacher) {
                    return res.status(404).json({
                        success: false,
                        message: "Profile giáo viên không tồn tại",
                    });
                }
                const studentAssignment = yield studentAssignmentService_1.default.gradeAssignment(studentAssignmentId, teacher._id, gradeData);
                res.json({
                    success: true,
                    message: "Chấm điểm thành công",
                    data: studentAssignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateStudentAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentAssignmentId } = req.params;
                const data = req.body;
                const studentAssignment = yield studentAssignmentService_1.default.updateStudentAssignment(studentAssignmentId, data);
                res.json({
                    success: true,
                    message: "Cập nhật student assignment thành công",
                    data: studentAssignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteStudentAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentAssignmentId } = req.params;
                yield studentAssignmentService_1.default.deleteStudentAssignment(studentAssignmentId);
                res.json({
                    success: true,
                    message: "Xóa student assignment thành công",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getGradedByTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const { Teacher } = require("../models/Teacher");
                const teacher = yield Teacher.findOne({ user_id: userId });
                if (!teacher) {
                    return res.status(404).json({
                        success: false,
                        message: "Profile giáo viên không tồn tại",
                    });
                }
                const result = yield studentAssignmentService_1.default.getGradedByTeacher(teacher._id, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài đã chấm thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new StudentAssignmentController();
