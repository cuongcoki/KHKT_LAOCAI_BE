"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const mongoose_1 = require("mongoose");
const DocumentSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề tài liệu là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Mô tả tối đa 1000 ký tự'],
    },
    file_url: {
        type: String,
        required: [true, 'File URL là bắt buộc'],
        trim: true,
    },
    file_name: {
        type: String,
        required: [true, 'Tên file gốc là bắt buộc'],
        trim: true,
    },
    file_type: {
        type: String,
        required: [true, 'Loại file là bắt buộc'],
        trim: true,
    },
    file_size: {
        type: Number,
        required: [true, 'Kích thước file là bắt buộc'],
        min: [0, 'Kích thước file không hợp lệ'],
    },
    subject_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject ID là bắt buộc'],
    },
    teacher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher ID là bắt buộc'],
    },
    grade_levels: {
        type: [Number],
        required: [true, 'Khối lớp là bắt buộc'],
        validate: {
            validator: function (levels) {
                return levels.length > 0 && levels.every((level) => level >= 10 && level <= 12);
            },
            message: 'Khối lớp phải từ 10 đến 12 và không được rỗng',
        },
    },
    tags: {
        type: [String],
        default: [],
    },
    is_public: {
        type: Boolean,
        default: true,
    },
    download_count: {
        type: Number,
        default: 0,
        min: [0, 'Download count không hợp lệ'],
    },
    view_count: {
        type: Number,
        default: 0,
        min: [0, 'View count không hợp lệ'],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
DocumentSchema.index({ subject_id: 1 });
DocumentSchema.index({ teacher_id: 1 });
DocumentSchema.index({ grade_levels: 1 });
DocumentSchema.index({ is_public: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });
DocumentSchema.virtual('subject', {
    ref: 'Subject',
    localField: 'subject_id',
    foreignField: '_id',
    justOne: true,
});
DocumentSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'teacher_id',
    foreignField: '_id',
    justOne: true,
});
DocumentSchema.methods.incrementDownloadCount = function () {
    this.download_count += 1;
    return this.save();
};
DocumentSchema.methods.incrementViewCount = function () {
    this.view_count += 1;
    return this.save();
};
DocumentSchema.statics.findBySubject = function (subjectId) {
    return this.find({ subject_id: subjectId, is_public: true })
        .populate('teacher_id subject_id')
        .sort({ created_at: -1 });
};
DocumentSchema.statics.findByTeacher = function (teacherId) {
    return this.find({ teacher_id: teacherId })
        .populate('subject_id')
        .sort({ created_at: -1 });
};
DocumentSchema.statics.findByGradeLevel = function (gradeLevel) {
    return this.find({ grade_levels: gradeLevel, is_public: true })
        .populate('teacher_id subject_id')
        .sort({ created_at: -1 });
};
DocumentSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
DocumentSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Document = (0, mongoose_1.model)('Document', DocumentSchema);
