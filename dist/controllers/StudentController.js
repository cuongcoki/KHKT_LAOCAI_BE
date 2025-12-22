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
const studentService_1 = __importDefault(require("../services/studentService"));
class StudentController {
    createProfileStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { userIdDiff } = req.params;
                const data = req.body;
                const student = yield studentService_1.default.createProfile(userId, data, userIdDiff, role);
                res.status(201).json({
                    success: true,
                    message: "Tạo profile học sinh thành công",
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfileStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const data = req.body;
                const student = yield studentService_1.default.updateProfile(userId, data);
                res.json({
                    success: true,
                    message: "Cập nhật profile học sinh thành công",
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProfileStudent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const student = yield studentService_1.default.getProfileByUserId(userId);
                res.json({
                    success: true,
                    message: "Lấy profile học sinh thành công",
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStudentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { studentId } = req.params;
                const student = yield studentService_1.default.getStudentById(studentId);
                res.json({
                    success: true,
                    message: "Lấy thông tin học sinh thành công",
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllStudents(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield studentService_1.default.getAllStudents(page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách học sinh thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllStudents1(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const students = yield studentService_1.default.getAllStudents1();
                res.json({
                    success: true,
                    message: "Lấy danh sách học sinh thành công",
                    data: students,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    searchByClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { className } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!className) {
                    return res.status(400).json({
                        success: false,
                        message: "Class name là bắt buộc",
                    });
                }
                const result = yield studentService_1.default.searchByClass(className, page, limit);
                res.json({
                    success: true,
                    message: "Tìm kiếm học sinh thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                yield studentService_1.default.deleteProfile(userId);
                res.json({
                    success: true,
                    message: "Xóa profile học sinh thành công",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new StudentController();
