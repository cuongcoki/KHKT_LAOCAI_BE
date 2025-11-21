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
const Class_1 = require("../models/Class");
class ClassService {
    createClass(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCode = yield Class_1.Class.findOne({ code: data.code });
            if (existingCode) {
                throw new errorHandle_1.ConflictError('Mã lớp đã tồn tại');
            }
            const classDoc = yield Class_1.Class.create(data);
            yield classDoc.populate('teacher_id subject_ids');
            winston_1.logger.info(`Class created: ${classDoc.code}`);
            return classDoc;
        });
    }
    updateClass(classId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const classDoc = yield Class_1.Class.findById(classId);
            if (!classDoc) {
                throw new errorHandle_1.NotFoundError('Lớp học không tồn tại');
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    classDoc[key] = data[key];
                }
            });
            yield classDoc.save();
            yield classDoc.populate('teacher_id subject_id');
            winston_1.logger.info(`Class updated: ${classDoc.code}`);
            return classDoc;
        });
    }
    getClassById(classId) {
        return __awaiter(this, void 0, void 0, function* () {
            const classDoc = yield Class_1.Class.findById(classId).populate('teacher_id subject_id');
            if (!classDoc) {
                throw new errorHandle_1.NotFoundError('Lớp học không tồn tại');
            }
            return classDoc;
        });
    }
    getAllClasses() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, filters = {}) {
            const skip = (page - 1) * limit;
            const query = {};
            if (filters.grade_level) {
                query.grade_level = filters.grade_level;
            }
            if (filters.is_active !== undefined) {
                query.is_active = filters.is_active;
            }
            if (filters.teacher_id) {
                query.teacher_id = filters.teacher_id;
            }
            const [classes, total] = yield Promise.all([
                Class_1.Class.find(query)
                    .populate('teacher_id subject_id')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Class_1.Class.countDocuments(query),
            ]);
            return {
                classes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getClassesByTeacher(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = yield Class_1.Class.findByTeacher(teacherId);
            return classes;
        });
    }
    getClassesByGradeLevel(gradeLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = yield Class_1.Class.findByGradeLevel(gradeLevel);
            return classes;
        });
    }
    deleteClass(classId) {
        return __awaiter(this, void 0, void 0, function* () {
            const classDoc = yield Class_1.Class.findByIdAndDelete(classId);
            if (!classDoc) {
                throw new errorHandle_1.NotFoundError('Lớp học không tồn tại');
            }
            winston_1.logger.info(`Class deleted: ${classDoc.code}`);
            return classDoc;
        });
    }
}
exports.default = new ClassService();
