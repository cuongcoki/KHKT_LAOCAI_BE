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
const assignmentService_1 = __importDefault(require("../services/assignmentService"));
const uploadFile_1 = require("../middlewares/uploadFile");
class AssignmentController {
    createAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const files = req.files;
                if (files && files.length > 0) {
                    const attachments = files.map((file) => ({
                        filename: file.originalname,
                        url: `/upload/${(0, uploadFile_1.getFileType)(file.mimetype)}/${file.filename}`,
                        size: file.size,
                        type: (0, uploadFile_1.getFileType)(file.mimetype),
                    }));
                    data.attachments = attachments;
                }
                const assignment = yield assignmentService_1.default.createAssignment(data);
                res.status(201).json({
                    success: true,
                    message: "Tạo bài tập thành công",
                    data: assignment,
                });
            }
            catch (error) {
                const files = req.files;
                if (files && files.length > 0) {
                    files.forEach((file) => (0, uploadFile_1.deleteFile)(file.path));
                }
                next(error);
            }
        });
    }
    getAssignmentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assignmentId } = req.params;
                const assignment = yield assignmentService_1.default.getAssignmentById(assignmentId);
                res.json({
                    success: true,
                    message: "Lấy thông tin bài tập thành công",
                    data: assignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllAssignments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield assignmentService_1.default.getAllAssignments(page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài tập thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAssignmentsByClass(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield assignmentService_1.default.getAssignmentsByClass(classId, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài tập theo lớp thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAssignmentsBySubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = yield assignmentService_1.default.getAssignmentsBySubject(subjectId, page, limit);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài tập theo môn học thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUpcomingAssignments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.query;
                const days = parseInt(req.query.days) || 7;
                const assignments = yield assignmentService_1.default.getUpcomingAssignments(classId, days);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài tập sắp đến hạn thành công",
                    data: assignments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPastDueAssignments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { classId } = req.query;
                const assignments = yield assignmentService_1.default.getPastDueAssignments(classId);
                res.json({
                    success: true,
                    message: "Lấy danh sách bài tập quá hạn thành công",
                    data: assignments,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assignmentId } = req.params;
                const data = req.body;
                const assignment = yield assignmentService_1.default.updateAssignment(assignmentId, data);
                res.json({
                    success: true,
                    message: "Cập nhật bài tập thành công",
                    data: assignment,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteAssignment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assignmentId } = req.params;
                yield assignmentService_1.default.deleteAssignment(assignmentId);
                res.json({
                    success: true,
                    message: "Xóa bài tập thành công",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAssignmentStatistics(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assignmentId } = req.params;
                const result = yield assignmentService_1.default.getAssignmentStatistics(assignmentId);
                res.json({
                    success: true,
                    message: "Lấy thống kê bài tập thành công",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AssignmentController();
