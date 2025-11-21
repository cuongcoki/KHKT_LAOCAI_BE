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
const StudentAssignment_1 = require("../models/StudentAssignment");
const Assignment_1 = require("../models/Assignment");
const Student_1 = require("../models/Student");
const Teacher_1 = require("../models/Teacher");
class StudentAssignmentService {
    createStudentAssignment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentExists = yield Student_1.Student.findById(data.student_id);
            if (!studentExists) {
                throw new errorHandle_1.NotFoundError("Học sinh không tồn tại");
            }
            const assignment = yield Assignment_1.Assignment.findById(data.assignment_id);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            const existing = yield StudentAssignment_1.StudentAssignment.findOne({
                student_id: data.student_id,
                assignment_id: data.assignment_id,
            });
            if (existing) {
                throw new errorHandle_1.ConflictError("Student assignment đã tồn tại");
            }
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.create({
                student_id: data.student_id,
                assignment_id: data.assignment_id,
                due_date: data.due_date || assignment.due_date,
                status: "not_submitted",
            });
            assignment.total_unsubmitted += 1;
            yield assignment.save();
            yield studentAssignment.populate([
                { path: "student_id", select: "student_code user_id" },
                { path: "assignment_id", select: "code title due_date max_score" },
            ]);
            winston_1.logger.info(`Student assignment created for student: ${data.student_id}`);
            return studentAssignment;
        });
    }
    getStudentAssignmentById(studentAssignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.findById(studentAssignmentId).populate([
                { path: "student_id", select: "student_code user_id" },
                { path: "assignment_id", select: "code title due_date max_score passing_score" },
                { path: "graded_by", select: "teacher_code user_id" },
            ]);
            if (!studentAssignment) {
                throw new errorHandle_1.NotFoundError("Student assignment không tồn tại");
            }
            return studentAssignment;
        });
    }
    getAllStudentAssignments() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [studentAssignments, total] = yield Promise.all([
                StudentAssignment_1.StudentAssignment.find()
                    .populate([
                    { path: "student_id", select: "student_code user_id" },
                    { path: "assignment_id", select: "code title due_date max_score" },
                    { path: "graded_by", select: "teacher_code user_id" },
                ])
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit),
                StudentAssignment_1.StudentAssignment.countDocuments(),
            ]);
            return {
                studentAssignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getAssignmentsByStudent(studentId_1) {
        return __awaiter(this, arguments, void 0, function* (studentId, page = 1, limit = 20) {
            const studentExists = yield Student_1.Student.findById(studentId);
            if (!studentExists) {
                throw new errorHandle_1.NotFoundError("Học sinh không tồn tại");
            }
            const studentAssignments = yield StudentAssignment_1.StudentAssignment.findByStudent(studentId, {
                page,
                limit,
            });
            const total = yield StudentAssignment_1.StudentAssignment.countDocuments({ student_id: studentId });
            return {
                studentAssignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getSubmissionsByAssignment(assignmentId_1) {
        return __awaiter(this, arguments, void 0, function* (assignmentId, page = 1, limit = 20) {
            const assignmentExists = yield Assignment_1.Assignment.findById(assignmentId);
            if (!assignmentExists) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            const studentAssignments = yield StudentAssignment_1.StudentAssignment.findByAssignment(assignmentId, {
                page,
                limit,
            });
            const total = yield StudentAssignment_1.StudentAssignment.countDocuments({
                assignment_id: assignmentId,
            });
            return {
                studentAssignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    getUnsubmittedByStudent(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentExists = yield Student_1.Student.findById(studentId);
            if (!studentExists) {
                throw new errorHandle_1.NotFoundError("Học sinh không tồn tại");
            }
            const studentAssignments = yield StudentAssignment_1.StudentAssignment.getUnsubmitted(studentId);
            return studentAssignments;
        });
    }
    submitAssignment(studentAssignmentId, studentId, submissionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.findById(studentAssignmentId);
            if (!studentAssignment) {
                throw new errorHandle_1.NotFoundError("Student assignment không tồn tại");
            }
            if (studentAssignment.student_id.toString() !== studentId.toString()) {
                throw new errorHandle_1.ForbiddenError("Bạn không có quyền nộp bài này");
            }
            if (studentAssignment.status === "graded") {
                throw new errorHandle_1.BadRequestError("Không thể nộp lại bài đã được chấm điểm");
            }
            if (submissionData.submission_file) {
                studentAssignment.submission_file = submissionData.submission_file;
            }
            if (submissionData.submission_text) {
                studentAssignment.submission_text = submissionData.submission_text;
            }
            yield studentAssignment.submit();
            yield studentAssignment.populate([
                { path: "student_id", select: "student_code user_id" },
                { path: "assignment_id", select: "code title due_date max_score" },
            ]);
            winston_1.logger.info(`Assignment submitted: ${studentAssignment.assignment_id} by student: ${studentId}`);
            return studentAssignment;
        });
    }
    gradeAssignment(studentAssignmentId, teacherId, gradeData) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.findById(studentAssignmentId);
            if (!studentAssignment) {
                throw new errorHandle_1.NotFoundError("Student assignment không tồn tại");
            }
            const teacher = yield Teacher_1.Teacher.findById(teacherId);
            if (!teacher) {
                throw new errorHandle_1.NotFoundError("Giáo viên không tồn tại");
            }
            if (studentAssignment.status === "not_submitted") {
                throw new errorHandle_1.BadRequestError("Không thể chấm điểm bài chưa nộp");
            }
            const assignment = yield Assignment_1.Assignment.findById(studentAssignment.assignment_id);
            if (!assignment) {
                throw new errorHandle_1.NotFoundError("Bài tập không tồn tại");
            }
            if (gradeData.score > assignment.max_score) {
                throw new errorHandle_1.BadRequestError(`Điểm không được vượt quá điểm tối đa (${assignment.max_score})`);
            }
            yield studentAssignment.grade(gradeData.score, gradeData.feedback || "", teacher._id);
            yield studentAssignment.populate([
                { path: "student_id", select: "student_code user_id" },
                { path: "assignment_id", select: "code title due_date max_score passing_score" },
                { path: "graded_by", select: "teacher_code user_id" },
            ]);
            winston_1.logger.info(`Assignment graded: ${studentAssignment.assignment_id} for student: ${studentAssignment.student_id}`);
            return studentAssignment;
        });
    }
    updateStudentAssignment(studentAssignmentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.findById(studentAssignmentId);
            if (!studentAssignment) {
                throw new errorHandle_1.NotFoundError("Student assignment không tồn tại");
            }
            if (data.student_id || data.assignment_id) {
                throw new errorHandle_1.BadRequestError("Không thể thay đổi student_id hoặc assignment_id sau khi tạo");
            }
            Object.keys(data).forEach((key) => {
                if (data[key] !== undefined) {
                    studentAssignment[key] = data[key];
                }
            });
            yield studentAssignment.save();
            yield studentAssignment.populate([
                { path: "student_id", select: "student_code user_id" },
                { path: "assignment_id", select: "code title due_date max_score" },
                { path: "graded_by", select: "teacher_code user_id" },
            ]);
            winston_1.logger.info(`Student assignment updated: ${studentAssignmentId}`);
            return studentAssignment;
        });
    }
    deleteStudentAssignment(studentAssignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentAssignment = yield StudentAssignment_1.StudentAssignment.findById(studentAssignmentId);
            if (!studentAssignment) {
                throw new errorHandle_1.NotFoundError("Student assignment không tồn tại");
            }
            if (studentAssignment.status === "submitted" ||
                studentAssignment.status === "late" ||
                studentAssignment.status === "graded") {
                yield Assignment_1.Assignment.findByIdAndUpdate(studentAssignment.assignment_id, {
                    $inc: { total_submitted: -1 },
                });
            }
            else {
                yield Assignment_1.Assignment.findByIdAndUpdate(studentAssignment.assignment_id, {
                    $inc: { total_unsubmitted: -1 },
                });
            }
            yield studentAssignment.deleteOne();
            winston_1.logger.info(`Student assignment deleted: ${studentAssignmentId}`);
            return studentAssignment;
        });
    }
    getGradedByTeacher(teacherId_1) {
        return __awaiter(this, arguments, void 0, function* (teacherId, page = 1, limit = 20) {
            const teacherExists = yield Teacher_1.Teacher.findById(teacherId);
            if (!teacherExists) {
                throw new errorHandle_1.NotFoundError("Giáo viên không tồn tại");
            }
            const skip = (page - 1) * limit;
            const [studentAssignments, total] = yield Promise.all([
                StudentAssignment_1.StudentAssignment.find({ graded_by: teacherId })
                    .populate([
                    { path: "student_id", select: "student_code user_id" },
                    { path: "assignment_id", select: "code title due_date max_score" },
                ])
                    .sort({ graded_at: -1 })
                    .skip(skip)
                    .limit(limit),
                StudentAssignment_1.StudentAssignment.countDocuments({ graded_by: teacherId }),
            ]);
            return {
                studentAssignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
}
exports.default = new StudentAssignmentService();
