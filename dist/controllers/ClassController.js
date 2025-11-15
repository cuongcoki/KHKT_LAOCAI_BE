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
const classService_1 = __importDefault(require("../services/classService"));
class ClassController {
    createClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const classDoc = yield classService_1.default.createClass(data);
                res.status(201).json({
                    success: true,
                    message: 'Tạo lớp học thành công',
                    data: classDoc,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.params;
                const data = req.body;
                const classDoc = yield classService_1.default.updateClass(classId, data);
                res.json({
                    success: true,
                    message: 'Cập nhật lớp học thành công',
                    data: classDoc,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getClassById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.params;
                const classDoc = yield classService_1.default.getClassById(classId);
                res.json({
                    success: true,
                    message: 'Lấy thông tin lớp học thành công',
                    data: classDoc,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllClasses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const filters = {
                    grade_level: req.query.grade_level ? parseInt(req.query.grade_level) : undefined,
                    is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
                    teacher_id: req.query.teacher_id,
                };
                const result = yield classService_1.default.getAllClasses(page, limit, filters);
                res.json({
                    success: true,
                    message: 'Lấy danh sách lớp học thành công',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getClassesByTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teacherId } = req.params;
                const classes = yield classService_1.default.getClassesByTeacher(teacherId);
                res.json({
                    success: true,
                    message: 'Lấy danh sách lớp của giáo viên thành công',
                    data: classes,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.params;
                yield classService_1.default.deleteClass(classId);
                res.json({
                    success: true,
                    message: 'Xóa lớp học thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new ClassController();
