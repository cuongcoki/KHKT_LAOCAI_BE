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
const Assignment_1 = require("../models/Assignment");
const StudentAssignment_1 = require("../models/StudentAssignment");
const Class_1 = require("../models/Class");
const Subject_1 = require("../models/Subject");
const Enrollment_1 = require("../models/Enrollment");
class AssignmentService {
    createAssignment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const classExists = yield Class_1.Class.findById(data.class_id);
            if (!classExists) {
                throw new errorHandle_1.NotFoundError("Lớp học không tồn tại");
            }
            const subjectExists = yield Subject_1.Subject.findById(data.subject_id);
            if (!subjectExists) {
                throw new errorHandle_1.NotFoundError("Môn học không tồn tại");
            }
            const existingCode = yield Assignment_1.Assignment.findOne({ code: data.code });
            if (existingCode) {
                throw new errorHandle_1.ConflictError("Mã bài tập đã tồn tại");
            }
            const assignment = yield Assignment_1.Assignment.create(data);
            const enrollments = yield Enrollment_1.Enrollment.find({
                class_id: data.class_id,
                status: "active",
            });
            if (enrollments.length > 0) {
                const studentAssignments = enrollments.map((enrollment) => ({
                    student_id: enrollment.student_id,
                    assignment_id: assignment._id,
                    due_date: assignment.due_date,
                    status: "not_submitted",
                }));
                yield StudentAssignment_1.StudentAssignment.insertMany(studentAssignments);
                assignment.total_unsubmitted = enrollments.length;
                yield assignment.save();
            }
            yield assignment.populate([
                { path: "class_id", select: "name code" },
                { path: "subject_id", select: "name code" },
            ]);
            winston_1.logger.info(`Assignment created: ${assignment.code}`);
            return assignment;
        });
    }
    getAssignmentById(assignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignment = yield Assignment_1.Assignment.findById(assignmentId).populate([
                { path: "class_id", select: "name code" },
                { path: "subject_id", select: "name code" },
            ]);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            return assignment;
        });
    }
    getAllAssignments() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [assignments, total] = yield Promise.all([
                Assignment_1.Assignment.find()
                    .populate([
                    { path: "class_id", select: "name code" },
                    { path: "subject_id", select: "name code" },
                ])
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                Assignment_1.Assignment.countDocuments(),
            ]);
            return {
                assignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getAssignmentsByClass(classId_1) {
        return __awaiter(this, arguments, void 0, function* (classId, page = 1, limit = 20) {
            const classExists = yield Class_1.Class.findById(classId);
            if (!classExists) {
                throw new errorHandle_1.NotFoundError("Lớp học không tồn tại");
            }
            const assignments = yield Assignment_1.Assignment.findByClass(classId, { page, limit });
            const total = yield Assignment_1.Assignment.countDocuments({ class_id: classId });
            return {
                assignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getAssignmentsBySubject(subjectId_1) {
        return __awaiter(this, arguments, void 0, function* (subjectId, page = 1, limit = 20) {
            const subjectExists = yield Subject_1.Subject.findById(subjectId);
            if (!subjectExists) {
                throw new errorHandle_1.NotFoundError("Môn học không tồn tại");
            }
            const assignments = yield Assignment_1.Assignment.findBySubject(subjectId, { page, limit });
            const total = yield Assignment_1.Assignment.countDocuments({ subject_id: subjectId });
            return {
                assignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getUpcomingAssignments(classId_1) {
        return __awaiter(this, arguments, void 0, function* (classId, days = 7) {
            const classExists = yield Class_1.Class.findById(classId);
            if (!classExists) {
                throw new errorHandle_1.NotFoundError("Lớp học không tồn tại");
            }
            const assignments = yield Assignment_1.Assignment.getUpcoming(classId, days);
            return assignments;
        });
    }
    getPastDueAssignments(classId) {
        return __awaiter(this, void 0, void 0, function* () {
            const classExists = yield Class_1.Class.findById(classId);
            if (!classExists) {
                throw new errorHandle_1.NotFoundError("Lớp học không tồn tại");
            }
            const assignments = yield Assignment_1.Assignment.getPastDue(classId);
            return assignments;
        });
    }
    updateAssignment(assignmentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignment = yield Assignment_1.Assignment.findById(assignmentId);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            if (data.class_id || data.subject_id || data.code) {
                throw new errorHandle_1.BadRequestError("Không thể thay đổi class_id, subject_id hoặc code sau khi tạo");
            }
            if (data.due_date) {
                yield StudentAssignment_1.StudentAssignment.updateMany({ assignment_id: assignmentId }, { due_date: data.due_date });
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    assignment[key] = data[key];
                }
            });
            yield assignment.save();
            yield assignment.populate([
                { path: "class_id", select: "name code" },
                { path: "subject_id", select: "name code" },
            ]);
            winston_1.logger.info(`Assignment updated: ${assignment.code}`);
            return assignment;
        });
    }
    deleteAssignment(assignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignment = yield Assignment_1.Assignment.findById(assignmentId);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            const submittedCount = yield StudentAssignment_1.StudentAssignment.countDocuments({
                assignment_id: assignmentId,
                status: { $in: ["submitted", "graded", "late"] },
            });
            if (submittedCount > 0) {
                throw new errorHandle_1.BadRequestError("Không thể xóa bài tập đã có học sinh nộp bài. Vui lòng xóa tất cả submissions trước.");
            }
            yield StudentAssignment_1.StudentAssignment.deleteMany({ assignment_id: assignmentId });
            yield assignment.deleteOne();
            winston_1.logger.info(`Assignment deleted: ${assignment.code}`);
            return assignment;
        });
    }
    getAssignmentStatistics(assignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignment = yield Assignment_1.Assignment.findById(assignmentId);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            const studentAssignments = yield StudentAssignment_1.StudentAssignment.find({
                assignment_id: assignmentId,
            });
            const statistics = {
                total_students: studentAssignments.length,
                submitted: studentAssignments.filter((sa) => sa.status === "submitted" || sa.status === "late" || sa.status === "graded").length,
                not_submitted: studentAssignments.filter((sa) => sa.status === "not_submitted")
                    .length,
                graded: studentAssignments.filter((sa) => sa.status === "graded").length,
                late: studentAssignments.filter((sa) => sa.status === "late").length,
                submission_rate: assignment.getSubmissionRate(),
                average_score: yield StudentAssignment_1.StudentAssignment.calculateAverageScore(assignmentId),
                passed: studentAssignments.filter((sa) => sa.score && sa.score >= assignment.passing_score).length,
                failed: studentAssignments.filter((sa) => sa.score !== null && sa.score !== undefined && sa.score < assignment.passing_score).length,
            };
            return {
                assignment,
                statistics,
            };
        });
    }
}
exports.default = new AssignmentService();
