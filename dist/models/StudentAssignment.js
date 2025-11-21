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
exports.StudentAssignment = void 0;
const mongoose_1 = require("mongoose");
const StudentAssignmentSchema = new mongoose_1.Schema({
    student_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID là bắt buộc'],
    },
    assignment_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: [true, 'Assignment ID là bắt buộc'],
    },
    submission_file: {
        type: String,
        trim: true,
    },
    submission_text: {
        type: String,
        trim: true,
        maxlength: [10000, 'Nội dung bài làm tối đa 10000 ký tự'],
    },
    submitted_at: {
        type: Date,
        default: null,
    },
    due_date: {
        type: Date,
        required: [true, 'Hạn nộp là bắt buộc'],
    },
    score: {
        type: Number,
        min: [0, 'Điểm không thể âm'],
        max: [100, 'Điểm không được vượt quá 100'],
        default: null,
    },
    feedback: {
        type: String,
        trim: true,
        maxlength: [2000, 'Nhận xét tối đa 2000 ký tự'],
    },
    status: {
        type: String,
        enum: {
            values: ['not_submitted', 'submitted', 'graded', 'late'],
            message: '{VALUE} không phải là trạng thái hợp lệ',
        },
        default: 'not_submitted',
    },
    graded_at: {
        type: Date,
        default: null,
    },
    graded_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
StudentAssignmentSchema.index({ student_id: 1 });
StudentAssignmentSchema.index({ assignment_id: 1 });
StudentAssignmentSchema.index({ status: 1 });
StudentAssignmentSchema.index({ submitted_at: -1 });
StudentAssignmentSchema.index({ graded_by: 1 });
StudentAssignmentSchema.index({ student_id: 1, assignment_id: 1 }, { unique: true });
StudentAssignmentSchema.virtual('is_late').get(function () {
    if (!this.submitted_at)
        return false;
    return this.submitted_at > this.due_date;
});
StudentAssignmentSchema.virtual('days_late').get(function () {
    if (!this.submitted_at || this.submitted_at <= this.due_date)
        return 0;
    const diff = this.submitted_at.getTime() - this.due_date.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
StudentAssignmentSchema.virtual('student', {
    ref: 'Student',
    localField: 'student_id',
    foreignField: '_id',
    justOne: true,
});
StudentAssignmentSchema.virtual('assignment', {
    ref: 'Assignment',
    localField: 'assignment_id',
    foreignField: '_id',
    justOne: true,
});
StudentAssignmentSchema.virtual('grader', {
    ref: 'Teacher',
    localField: 'graded_by',
    foreignField: '_id',
    justOne: true,
});
StudentAssignmentSchema.methods.submit = function () {
    if (this.status === 'graded') {
        throw new Error('Không thể nộp lại bài đã được chấm điểm');
    }
    this.submitted_at = new Date();
    if (this.submitted_at > this.due_date) {
        this.status = 'late';
    }
    else {
        this.status = 'submitted';
    }
    return this.save();
};
StudentAssignmentSchema.methods.grade = function (score, feedback, gradedBy) {
    if (this.status === 'not_submitted') {
        throw new Error('Không thể chấm điểm bài chưa nộp');
    }
    this.score = score;
    this.feedback = feedback;
    this.graded_at = new Date();
    this.graded_by = gradedBy;
    this.status = 'graded';
    return this.save();
};
StudentAssignmentSchema.methods.isSubmitted = function () {
    return this.status === 'submitted' || this.status === 'graded' || this.status === 'late';
};
StudentAssignmentSchema.methods.isGraded = function () {
    return this.status === 'graded';
};
StudentAssignmentSchema.methods.isLate = function () {
    return this.status === 'late';
};
StudentAssignmentSchema.statics.findByStudent = function (studentId, options) {
    const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
    return this.find({ student_id: studentId })
        .sort({ due_date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignment_id');
};
StudentAssignmentSchema.statics.findByAssignment = function (assignmentId, options) {
    const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
    return this.find({ assignment_id: assignmentId })
        .sort({ submitted_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('student_id');
};
StudentAssignmentSchema.statics.getUnsubmitted = function (studentId) {
    return this.find({
        student_id: studentId,
        status: 'not_submitted',
    })
        .sort({ due_date: 1 })
        .populate('assignment_id');
};
StudentAssignmentSchema.statics.getGradedByTeacher = function (teacherId) {
    return this.find({ graded_by: teacherId })
        .sort({ graded_at: -1 })
        .populate('student_id')
        .populate('assignment_id');
};
StudentAssignmentSchema.statics.calculateAverageScore = function (assignmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield this.aggregate([
            {
                $match: {
                    assignment_id: new mongoose_1.Types.ObjectId(assignmentId),
                    status: 'graded',
                    score: { $ne: null },
                },
            },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                },
            },
        ]);
        return result.length > 0 ? Math.round(result[0].averageScore * 100) / 100 : 0;
    });
};
StudentAssignmentSchema.post('save', function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (doc.status === 'submitted' || doc.status === 'late') {
            const Assignment = (0, mongoose_1.model)('Assignment');
            yield Assignment.findByIdAndUpdate(doc.assignment_id, {
                $inc: { total_submitted: 1, total_unsubmitted: -1 },
            });
        }
    });
});
StudentAssignmentSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
StudentAssignmentSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.StudentAssignment = (0, mongoose_1.model)('StudentAssignment', StudentAssignmentSchema);
