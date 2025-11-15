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
const subjectService_1 = __importDefault(require("../services/subjectService"));
class SubjectController {
    createSubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const subject = yield subjectService_1.default.createSubject(data);
                res.status(201).json({
                    success: true,
                    message: 'Tạo môn học thành công',
                    data: subject,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateSubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId } = req.params;
                const data = req.body;
                const subject = yield subjectService_1.default.updateSubject(subjectId, data);
                res.json({
                    success: true,
                    message: 'Cập nhật môn học thành công',
                    data: subject,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSubjectById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId } = req.params;
                const subject = yield subjectService_1.default.getSubjectById(subjectId);
                res.json({
                    success: true,
                    message: 'Lấy thông tin môn học thành công',
                    data: subject,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllSubjects(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const filters = {
                    is_active: req.query.is_active === 'true'
                        ? true
                        : req.query.is_active === 'false'
                            ? false
                            : undefined,
                    grade_level: req.query.grade_level
                        ? parseInt(req.query.grade_level)
                        : undefined,
                };
                const result = yield subjectService_1.default.getAllSubjects(page, limit, filters);
                res.json({
                    success: true,
                    message: 'Lấy danh sách môn học thành công',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSubjectsByGradeLevel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gradeLevel = parseInt(req.query.grade_level);
                if (!gradeLevel || gradeLevel < 10 || gradeLevel > 12) {
                    return res.status(400).json({
                        success: false,
                        message: 'Grade level phải từ 10 đến 12',
                    });
                }
                const subjects = yield subjectService_1.default.getSubjectsByGradeLevel(gradeLevel);
                res.json({
                    success: true,
                    message: 'Lấy danh sách môn học theo khối thành công',
                    data: subjects,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteSubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId } = req.params;
                yield subjectService_1.default.deleteSubject(subjectId);
                res.json({
                    success: true,
                    message: 'Xóa môn học thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new SubjectController();
