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
const Enrollment_1 = require("../models/Enrollment");
const Class_1 = require("../models/Class");
const Student_1 = require("../models/Student");
class EnrollmentService {
    createEnrollment(studentId, classId) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = yield Student_1.Student.findById(studentId);
            if (!student) {
                throw new errorHandle_1.NotFoundError('Học sinh không tồn tại');
            }
            const classDoc = yield Class_1.Class.findById(classId);
            if (!classDoc) {
                throw new errorHandle_1.NotFoundError('Lớp học không tồn tại');
            }
            if (!classDoc.is_active) {
                throw new errorHandle_1.BadRequestError('Lớp học không hoạt động');
            }
            if (classDoc.isFull()) {
                throw new errorHandle_1.BadRequestError('Lớp học đã đầy');
            }
            const existingEnrollment = yield Enrollment_1.Enrollment.findOne({
                student_id: studentId,
                class_id: classId,
            });
            if (existingEnrollment) {
                throw new errorHandle_1.ConflictError('Học sinh đã đăng ký lớp này rồi');
            }
            const enrollment = yield Enrollment_1.Enrollment.create({
                student_id: studentId,
                class_id: classId,
            });
            yield classDoc.addStudent();
            yield enrollment.populate('student_id class_id');
            winston_1.logger.info(`Enrollment created: Student ${studentId} enrolled in Class ${classId}`);
            return enrollment;
        });
    }
    updateEnrollment(enrollmentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId);
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    enrollment[key] = data[key];
                }
            });
            yield enrollment.save();
            yield enrollment.populate('student_id class_id');
            winston_1.logger.info(`Enrollment updated: ${enrollmentId}`);
            return enrollment;
        });
    }
    getEnrollmentById(enrollmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId).populate('student_id class_id');
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            return enrollment;
        });
    }
    getAllEnrollments() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, filters = {}) {
            const skip = (page - 1) * limit;
            const query = {};
            if (filters.student_id) {
                query.student_id = filters.student_id;
            }
            if (filters.class_id) {
                query.class_id = filters.class_id;
            }
            if (filters.status) {
                query.status = filters.status;
            }
            const [enrollments, total] = yield Promise.all([
                Enrollment_1.Enrollment.find(query)
                    .populate('student_id class_id')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Enrollment_1.Enrollment.countDocuments(query),
            ]);
            return {
                enrollments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getEnrollmentsByStudent(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollments = yield Enrollment_1.Enrollment.findByStudent(studentId);
            return enrollments;
        });
    }
    getEnrollmentsByClass(classId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollments = yield Enrollment_1.Enrollment.find({ class_id: classId })
                .populate({
                path: 'student_id',
                populate: {
                    path: 'user_id',
                    select: 'username email full_name avatar phone',
                },
            })
                .populate('class_id')
                .sort({ created_at: -1 });
            return enrollments;
        });
    }
    dropEnrollment(enrollmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId).populate('class_id');
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            if (enrollment.status !== 'active') {
                throw new errorHandle_1.BadRequestError('Chỉ có thể drop enrollment đang active');
            }
            yield enrollment.drop();
            const classDoc = yield Class_1.Class.findById(enrollment.class_id);
            if (classDoc) {
                yield classDoc.removeStudent();
            }
            winston_1.logger.info(`Enrollment dropped: ${enrollmentId}`);
            return enrollment;
        });
    }
    completeEnrollment(enrollmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId);
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            yield enrollment.complete();
            winston_1.logger.info(`Enrollment completed: ${enrollmentId}`);
            return enrollment;
        });
    }
    updateGrade(enrollmentId, grade) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId);
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            yield enrollment.updateGrade(grade);
            winston_1.logger.info(`Grade updated for enrollment: ${enrollmentId}`);
            return enrollment;
        });
    }
    deleteEnrollment(enrollmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const enrollment = yield Enrollment_1.Enrollment.findById(enrollmentId).populate('class_id');
            if (!enrollment) {
                throw new errorHandle_1.NotFoundError('Enrollment không tồn tại');
            }
            if (enrollment.status === 'active') {
                const classDoc = yield Class_1.Class.findById(enrollment.class_id);
                if (classDoc) {
                    yield classDoc.removeStudent();
                }
            }
            yield Enrollment_1.Enrollment.findByIdAndDelete(enrollmentId);
            winston_1.logger.info(`Enrollment deleted: ${enrollmentId}`);
            return enrollment;
        });
    }
}
exports.default = new EnrollmentService();
