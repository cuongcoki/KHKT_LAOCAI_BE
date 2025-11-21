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
const Teacher_1 = require("../models/Teacher");
const User_1 = require("../models/User");
class TeacherService {
    createProfile(userId, data, userIdDiff, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUserId = role === "teacher" ? userId : userIdDiff;
            if (!targetUserId) {
                throw new errorHandle_1.BadRequestError("Thiếu userIdDiff để tạo profile giáo viên");
            }
            const existingTeacher = yield Teacher_1.Teacher.findOne({ user_id: targetUserId });
            if (existingTeacher) {
                throw new errorHandle_1.ConflictError("Profile giáo viên đã tồn tại");
            }
            const existingCode = yield Teacher_1.Teacher.findOne({ teacher_code: data.teacher_code });
            if (existingCode) {
                throw new errorHandle_1.ConflictError("Mã giáo viên đã tồn tại");
            }
            const teacher = yield Teacher_1.Teacher.create(Object.assign({ user_id: targetUserId }, data));
            yield teacher.populate("user_id", "username email full_name");
            winston_1.logger.info(`Teacher profile created: ${teacher.teacher_code}`);
            return teacher;
        });
    }
    updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const teacher = yield Teacher_1.Teacher.findOne({ user_id: userId });
            if (!teacher) {
                throw new errorHandle_1.NotFoundError("Profile giáo viên không tồn tại");
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    teacher[key] = data[key];
                }
            });
            yield teacher.save();
            yield teacher.populate("user_id", "username email full_name");
            winston_1.logger.info(`Teacher profile updated: ${teacher.teacher_code}`);
            return teacher;
        });
    }
    getProfileByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            winston_1.logger.info(userId);
            const teacher = yield Teacher_1.Teacher.findOne({ user_id: userId }).populate("user_id", "username email full_name avatar phone");
            if (!teacher) {
                throw new errorHandle_1.NotFoundError("Profile giáo viên không tồn tại");
            }
            return teacher;
        });
    }
    getTeacherById(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            winston_1.logger.info(teacherId);
            const teacher = yield User_1.User.findById(teacherId);
            const checkRole = yield User_1.User.findOne({ _id: teacherId, role: 'teacher' });
            if (!checkRole) {
                throw new errorHandle_1.NotFoundError("Giáo viên không tồn tại");
            }
            if (!teacher) {
                throw new errorHandle_1.NotFoundError("Giáo viên không tồn tại");
            }
            return teacher;
        });
    }
    getAllTeachers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [teachers, total] = yield Promise.all([
                Teacher_1.Teacher.find()
                    .populate("user_id", "username email full_name avatar")
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Teacher_1.Teacher.countDocuments(),
            ]);
            return {
                teachers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    searchBySpecialization(subject_1) {
        return __awaiter(this, arguments, void 0, function* (subject, page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [teachers, total] = yield Promise.all([
                Teacher_1.Teacher.find({ specialization: subject })
                    .populate("user_id", "username email full_name avatar")
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Teacher_1.Teacher.countDocuments({ specialization: subject }),
            ]);
            return {
                teachers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    deleteProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const teacher = yield Teacher_1.Teacher.findOneAndDelete({ user_id: userId });
            if (!teacher) {
                throw new errorHandle_1.NotFoundError("Profile giáo viên không tồn tại");
            }
            winston_1.logger.info(`Teacher profile deleted: ${teacher.teacher_code}`);
            return teacher;
        });
    }
}
exports.default = new TeacherService();
