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
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../helpers/winston");
const errorHandle_1 = require("../utils/errorHandle");
const Document_1 = require("../models/Document");
class DocumentService {
    createDocument(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield Document_1.Document.create(data);
            yield document.populate('teacher_id subject_id');
            winston_1.logger.info(`Document created: ${document.title}`);
            return document;
        });
    }
    updateDocument(documentId, userId, userRole, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield Document_1.Document.findById(documentId).populate('teacher_id');
            if (!document) {
                throw new errorHandle_1.NotFoundError('Tài liệu không tồn tại');
            }
            if (userRole !== 'admin' && document.teacher_id.user_id.toString() !== userId) {
                throw new errorHandle_1.ForbiddenError('Bạn không có quyền cập nhật tài liệu này');
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    document[key] = data[key];
                }
            });
            yield document.save();
            yield document.populate('teacher_id subject_id');
            winston_1.logger.info(`Document updated: ${document.title}`);
            return document;
        });
    }
    getDocumentById(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield Document_1.Document.findById(documentId).populate('teacher_id subject_id');
            if (!document) {
                throw new errorHandle_1.NotFoundError('Tài liệu không tồn tại');
            }
            yield document.incrementViewCount();
            return document;
        });
    }
    getAllDocuments() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, filters = {}) {
            const skip = (page - 1) * limit;
            const query = {};
            if (filters.subject_id) {
                query.subject_id = filters.subject_id;
            }
            if (filters.teacher_id) {
                query.teacher_id = filters.teacher_id;
            }
            if (filters.grade_level) {
                query.grade_levels = filters.grade_level;
            }
            if (filters.file_type) {
                query.file_type = filters.file_type;
            }
            if (filters.is_public !== undefined) {
                query.is_public = filters.is_public;
            }
            else {
                query.is_public = true;
            }
            if (filters.search) {
                query.$text = { $search: filters.search };
            }
            const [documents, total] = yield Promise.all([
                Document_1.Document.find(query)
                    .populate('teacher_id subject_id')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Document_1.Document.countDocuments(query),
            ]);
            return {
                documents,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getDocumentsBySubject(subjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = yield Document_1.Document.findBySubject(subjectId);
            return documents;
        });
    }
    getDocumentsByTeacher(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = yield Document_1.Document.findByTeacher(teacherId);
            return documents;
        });
    }
    getDocumentsByGradeLevel(gradeLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = yield Document_1.Document.findByGradeLevel(gradeLevel);
            return documents;
        });
    }
    downloadDocument(documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield Document_1.Document.findById(documentId);
            if (!document) {
                throw new errorHandle_1.NotFoundError('Tài liệu không tồn tại');
            }
            yield document.incrementDownloadCount();
            return document;
        });
    }
    deleteDocument(documentId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield Document_1.Document.findById(documentId).populate('teacher_id');
            if (!document) {
                throw new errorHandle_1.NotFoundError('Tài liệu không tồn tại');
            }
            if (userRole !== 'admin' && document.teacher_id.user_id.toString() !== userId) {
                throw new errorHandle_1.ForbiddenError('Bạn không có quyền xóa tài liệu này');
            }
            yield Document_1.Document.findByIdAndDelete(documentId);
            winston_1.logger.info(`Document deleted: ${document.title}`);
            return document;
        });
    }
}
exports.default = new DocumentService();
