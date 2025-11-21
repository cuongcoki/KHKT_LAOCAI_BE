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
const documentService_1 = __importDefault(require("../services/documentService"));
class DocumentController {
    createDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const file = req.file;
                if (!file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vui lòng upload file',
                    });
                }
                const documentData = Object.assign(Object.assign({}, data), { file_url: `/upload/document/${file.filename}`, file_name: file.originalname, file_size: file.size, file_type: file.mimetype });
                const document = yield documentService_1.default.createDocument(documentData);
                res.status(201).json({
                    success: true,
                    message: 'Tạo tài liệu thành công',
                    data: document,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { documentId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const data = req.body;
                const document = yield documentService_1.default.updateDocument(documentId, userId, userRole, data);
                res.json({
                    success: true,
                    message: 'Cập nhật tài liệu thành công',
                    data: document,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getDocumentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { documentId } = req.params;
                const document = yield documentService_1.default.getDocumentById(documentId);
                res.json({
                    success: true,
                    message: 'Lấy thông tin tài liệu thành công',
                    data: document,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllDocuments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const filters = {
                    subject_id: req.query.subject_id,
                    teacher_id: req.query.teacher_id,
                    grade_level: req.query.grade_level ? parseInt(req.query.grade_level) : undefined,
                    file_type: req.query.file_type,
                    is_public: req.query.is_public === 'true'
                        ? true
                        : req.query.is_public === 'false'
                            ? false
                            : undefined,
                    search: req.query.search,
                };
                const result = yield documentService_1.default.getAllDocuments(page, limit, filters);
                res.json({
                    success: true,
                    message: 'Lấy danh sách tài liệu thành công',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getDocumentsBySubject(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subjectId } = req.params;
                const documents = yield documentService_1.default.getDocumentsBySubject(subjectId);
                res.json({
                    success: true,
                    message: 'Lấy tài liệu theo môn học thành công',
                    data: documents,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getDocumentsByTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teacherId } = req.params;
                const documents = yield documentService_1.default.getDocumentsByTeacher(teacherId);
                res.json({
                    success: true,
                    message: 'Lấy tài liệu của giáo viên thành công',
                    data: documents,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    downloadDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { documentId } = req.params;
                const document = yield documentService_1.default.downloadDocument(documentId);
                res.json({
                    success: true,
                    message: 'Download tài liệu thành công',
                    data: {
                        file_url: document.file_url,
                        title: document.title,
                        file_type: document.file_type,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { documentId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                yield documentService_1.default.deleteDocument(documentId, userId, userRole);
                res.json({
                    success: true,
                    message: 'Xóa tài liệu thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new DocumentController();
