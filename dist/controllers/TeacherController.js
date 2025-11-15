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
const winston_1 = require("../helpers/winston");
const teacherService_1 = __importDefault(require("../services/teacherService"));
class TeacherController {
    createProfileTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { userIdDiff } = req.params;
                const data = req.body;
                const teacher = yield teacherService_1.default.createProfile(userId, data, userIdDiff, role);
                res.status(201).json({
                    success: true,
                    message: "Tạo profile giáo viên thành công",
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfileTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const data = req.body;
                const teacher = yield teacherService_1.default.updateProfile(userId, data);
                res.json({
                    success: true,
                    message: "Cập nhật profile giáo viên thành công",
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProfileTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const teacher = yield teacherService_1.default.getProfileByUserId(userId);
                res.json({
                    success: true,
                    message: "Lấy profile giáo viên thành công",
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTeacherById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teacherId } = req.params;
                winston_1.logger.info(teacherId);
                const teacher = yield teacherService_1.default.getTeacherById(teacherId);
                res.json({
                    success: true,
                    message: "Lấy thông tin giáo viên thành công",
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllTeachers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield teacherService_1.default.getAllTeachers(page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách giáo viên thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    searchBySubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subject } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!subject) {
                    return res.status(400).json({
                        success: false,
                        message: "Subject là bắt buộc",
                    });
                }
                const result = yield teacherService_1.default.searchBySpecialization(subject, page, limit);
                res.json({
                    success: true,
                    message: "Tìm kiếm giáo viên thành công",
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
                yield teacherService_1.default.deleteProfile(userId);
                res.json({
                    success: true,
                    message: "Xóa profile giáo viên thành công",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new TeacherController();
