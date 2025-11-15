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
const Subject_1 = require("../models/Subject");
class SubjectService {
    createSubject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCode = yield Subject_1.Subject.findOne({ code: data.code });
            if (existingCode) {
                throw new errorHandle_1.ConflictError('Mã môn học đã tồn tại');
            }
            const existingName = yield Subject_1.Subject.findOne({ name: data.name });
            if (existingName) {
                throw new errorHandle_1.ConflictError('Tên môn học đã tồn tại');
            }
            const subject = yield Subject_1.Subject.create(data);
            winston_1.logger.info(`Subject created: ${subject.code}`);
            return subject;
        });
    }
    updateSubject(subjectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = yield Subject_1.Subject.findById(subjectId);
            if (!subject) {
                throw new errorHandle_1.NotFoundError('Môn học không tồn tại');
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    subject[key] = data[key];
                }
            });
            yield subject.save();
            winston_1.logger.info(`Subject updated: ${subject.code}`);
            return subject;
        });
    }
    getSubjectById(subjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = yield Subject_1.Subject.findById(subjectId);
            if (!subject) {
                throw new errorHandle_1.NotFoundError('Môn học không tồn tại');
            }
            return subject;
        });
    }
    getAllSubjects() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, filters = {}) {
            const skip = (page - 1) * limit;
            const query = {};
            if (filters.is_active !== undefined) {
                query.is_active = filters.is_active;
            }
            if (filters.grade_level) {
                query.grade_levels = filters.grade_level;
            }
            const [subjects, total] = yield Promise.all([
                Subject_1.Subject.find(query).sort({ name: 1 }).skip(skip).limit(limit),
                Subject_1.Subject.countDocuments(query),
            ]);
            return {
                subjects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getSubjectsByGradeLevel(gradeLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const subjects = yield Subject_1.Subject.findByGradeLevel(gradeLevel);
            return subjects;
        });
    }
    deleteSubject(subjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = yield Subject_1.Subject.findByIdAndDelete(subjectId);
            if (!subject) {
                throw new errorHandle_1.NotFoundError('Môn học không tồn tại');
            }
            winston_1.logger.info(`Subject deleted: ${subject.code}`);
            return subject;
        });
    }
}
exports.default = new SubjectService();
