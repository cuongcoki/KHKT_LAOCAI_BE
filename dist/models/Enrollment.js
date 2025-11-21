"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const mongoose_1 = require("mongoose");
const EnrollmentSchema = new mongoose_1.Schema({
    student_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID là bắt buộc'],
    },
    class_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Class ID là bắt buộc'],
    },
    enrollment_date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'completed', 'dropped'],
            message: 'Status phải là: active, completed, hoặc dropped',
        },
        default: 'active',
    },
    grade: {
        type: Number,
        min: [0, 'Điểm phải từ 0 đến 10'],
        max: [10, 'Điểm phải từ 0 đến 10'],
    },
    attendance_count: {
        type: Number,
        default: 0,
        min: [0, 'Số buổi học không hợp lệ'],
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Ghi chú tối đa 500 ký tự'],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
EnrollmentSchema.index({ student_id: 1, class_id: 1 }, { unique: true });
EnrollmentSchema.index({ student_id: 1 });
EnrollmentSchema.index({ class_id: 1 });
EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.virtual('student', {
    ref: 'Student',
    localField: 'student_id',
    foreignField: '_id',
    justOne: true,
});
EnrollmentSchema.virtual('class', {
    ref: 'Class',
    localField: 'class_id',
    foreignField: '_id',
    justOne: true,
});
EnrollmentSchema.methods.complete = function () {
    this.status = 'completed';
    return this.save();
};
EnrollmentSchema.methods.drop = function () {
    this.status = 'dropped';
    return this.save();
};
EnrollmentSchema.methods.updateGrade = function (grade) {
    if (grade < 0 || grade > 10) {
        throw new Error('Điểm phải từ 0 đến 10');
    }
    this.grade = grade;
    return this.save();
};
EnrollmentSchema.statics.findByStudent = function (studentId) {
    return this.find({ student_id: studentId })
        .populate('class_id')
        .sort({ created_at: -1 });
};
EnrollmentSchema.statics.findByClass = function (classId) {
    return this.find({ class_id: classId })
        .populate({
        path: 'student_id',
        populate: {
            path: 'user_id',
            select: 'username email full_name avatar phone',
        },
    })
        .sort({ created_at: -1 });
};
EnrollmentSchema.statics.findActiveByStudent = function (studentId) {
    return this.find({ student_id: studentId, status: 'active' })
        .populate('class_id')
        .sort({ created_at: -1 });
};
EnrollmentSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
EnrollmentSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Enrollment = (0, mongoose_1.model)('Enrollment', EnrollmentSchema);
