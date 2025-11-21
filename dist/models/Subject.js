"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
const mongoose_1 = require("mongoose");
const SubjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Tên môn học là bắt buộc'],
        trim: true,
        unique: true,
        maxlength: [100, 'Tên môn học tối đa 100 ký tự'],
    },
    code: {
        type: String,
        required: [true, 'Mã môn học là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Mã môn học tối đa 20 ký tự'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả tối đa 500 ký tự'],
    },
    grade_levels: {
        type: [Number],
        required: [true, 'Khối lớp là bắt buộc'],
        validate: {
            validator: function (levels) {
                return (levels.length > 0 &&
                    levels.every((level) => level >= 10 && level <= 12));
            },
            message: 'Khối lớp phải từ 10 đến 12 và không được rỗng',
        },
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
SubjectSchema.index({ code: 1 });
SubjectSchema.index({ name: 1 });
SubjectSchema.index({ is_active: 1 });
SubjectSchema.index({ grade_levels: 1 });
SubjectSchema.methods.isAvailableForGrade = function (gradeLevel) {
    return this.grade_levels.includes(gradeLevel);
};
SubjectSchema.statics.findByGradeLevel = function (gradeLevel) {
    return this.find({
        grade_levels: gradeLevel,
        is_active: true,
    }).sort({ name: 1 });
};
SubjectSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
SubjectSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Subject = (0, mongoose_1.model)('Subject', SubjectSchema);
