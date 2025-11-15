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
const Student_1 = require("../models/Student");
const User_1 = require("../models/User");
class StudentService {
    createProfile(userId, data, userIdDiff, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUserId = role === "student" ? userId : userIdDiff;
            const checkRoleStudent = yield User_1.User.findOne({
                _id: targetUserId,
                role: "student",
            });
            if (!checkRoleStudent) {
                throw new errorHandle_1.NotFoundError("Học sinh không tồn tại");
            }
            const existingStudent = yield Student_1.Student.findOne({ user_id: targetUserId });
            if (existingStudent) {
                throw new errorHandle_1.ConflictError("Profile học sinh đã tồn tại");
            }
            const existingCode = yield Student_1.Student.findOne({
                student_code: data.student_code,
            });
            if (existingCode) {
                throw new errorHandle_1.ConflictError("Mã học sinh đã tồn tại");
            }
            const student = yield Student_1.Student.create(Object.assign({ user_id: targetUserId }, data));
            yield student.populate("user_id", "username email full_name");
            winston_1.logger.info(`Student profile created: ${student.student_code}`);
            return student;
        });
    }
    updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = yield Student_1.Student.findOne({ user_id: userId });
            if (!student) {
                throw new errorHandle_1.NotFoundError("Profile học sinh không tồn tại");
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    student[key] = data[key];
                }
            });
            yield student.save();
            yield student.populate("user_id", "username email full_name");
            winston_1.logger.info(`Student profile updated: ${student.student_code}`);
            return student;
        });
    }
    getProfileByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = yield Student_1.Student.findOne({ user_id: userId }).populate("user_id", "username email full_name avatar phone");
            if (!student) {
                throw new errorHandle_1.NotFoundError("Profile học sinh không tồn tại");
            }
            return student;
        });
    }
    getStudentById(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = yield Student_1.Student.findById(studentId).populate("user_id", "username email full_name avatar");
            if (!student) {
                throw new errorHandle_1.NotFoundError("Học sinh không tồn tại");
            }
            return student;
        });
    }
    getAllStudents() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [students, total] = yield Promise.all([
                Student_1.Student.find()
                    .populate("user_id", "username email full_name avatar")
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Student_1.Student.countDocuments(),
            ]);
            return {
                students,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    searchByClass(className_1) {
        return __awaiter(this, arguments, void 0, function* (className, page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [students, total] = yield Promise.all([
                Student_1.Student.find({ current_class: className })
                    .populate("user_id", "username email full_name avatar")
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Student_1.Student.countDocuments({ current_class: className }),
            ]);
            return {
                students,
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
            const student = yield Student_1.Student.findOneAndDelete({ user_id: userId });
            if (!student) {
                throw new errorHandle_1.NotFoundError("Profile học sinh không tồn tại");
            }
            winston_1.logger.info(`Student profile deleted: ${student.student_code}`);
            return student;
        });
    }
}
exports.default = new StudentService();
