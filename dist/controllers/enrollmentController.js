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
const enrollmentService_1 = __importDefault(require("../services/enrollmentService"));
class EnrollmentController {
    createEnrollment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { student_id, class_id } = req.body;
                const enrollment = yield enrollmentService_1.default.createEnrollment(student_id, class_id);
                res.status(201).json({
                    success: true,
                    message: 'Đăng ký lớp thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateEnrollment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                const data = req.body;
                const enrollment = yield enrollmentService_1.default.updateEnrollment(enrollmentId, data);
                res.json({
                    success: true,
                    message: 'Cập nhật enrollment thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEnrollmentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                const enrollment = yield enrollmentService_1.default.getEnrollmentById(enrollmentId);
                res.json({
                    success: true,
                    message: 'Lấy thông tin enrollment thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllEnrollments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const filters = {
                    student_id: req.query.student_id,
                    class_id: req.query.class_id,
                    status: req.query.status,
                };
                const result = yield enrollmentService_1.default.getAllEnrollments(page, limit, filters);
                res.json({
                    success: true,
                    message: 'Lấy danh sách enrollment thành công',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEnrollmentsByStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const enrollments = yield enrollmentService_1.default.getEnrollmentsByStudent(studentId);
                res.json({
                    success: true,
                    message: 'Lấy danh sách lớp của học sinh thành công',
                    data: enrollments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getEnrollmentsByClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.params;
                const enrollments = yield enrollmentService_1.default.getEnrollmentsByClass(classId);
                res.json({
                    success: true,
                    message: 'Lấy danh sách học sinh trong lớp thành công',
                    data: enrollments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    dropEnrollment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                const enrollment = yield enrollmentService_1.default.dropEnrollment(enrollmentId);
                res.json({
                    success: true,
                    message: 'Rời khỏi lớp thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    completeEnrollment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                const enrollment = yield enrollmentService_1.default.completeEnrollment(enrollmentId);
                res.json({
                    success: true,
                    message: 'Hoàn thành lớp học thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateGrade(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                const { grade } = req.body;
                const enrollment = yield enrollmentService_1.default.updateGrade(enrollmentId, grade);
                res.json({
                    success: true,
                    message: 'Cập nhật điểm thành công',
                    data: enrollment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteEnrollment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { enrollmentId } = req.params;
                yield enrollmentService_1.default.deleteEnrollment(enrollmentId);
                res.json({
                    success: true,
                    message: 'Xóa enrollment thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new EnrollmentController();
