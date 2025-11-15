"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
const mongoose_1 = require("mongoose");
const ClassSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Tên lớp là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên lớp tối đa 100 ký tự'],
    },
    code: {
        type: String,
        required: [true, 'Mã lớp là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [
            /^(10|11|12)[A-Z][0-9]{1,2}$/,
            'Mã lớp phải có định dạng: Khối + Chữ cái + Số (VD: 10A1)',
        ],
    },
    grade_level: {
        type: Number,
        required: [true, 'Khối lớp là bắt buộc'],
        min: [10, 'Khối lớp phải từ 10 đến 12'],
        max: [12, 'Khối lớp phải từ 10 đến 12'],
    },
    teacher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher ID là bắt buộc'],
    },
    subject_ids: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Subject',
        required: [true, 'Subject IDs là bắt buộc'],
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Lớp phải có ít nhất 1 môn học'
        }
    },
    max_students: {
        type: Number,
        default: 40,
        min: [1, 'Số học sinh tối đa phải lớn hơn 0'],
        max: [50, 'Số học sinh tối đa không quá 50'],
    },
    current_students: {
        type: Number,
        default: 0,
        min: [0, 'Số học sinh hiện tại không hợp lệ'],
    },
    school_year: {
        type: String,
        required: [true, 'Năm học là bắt buộc'],
        match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (VD: 2024-2025)'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả tối đa 500 ký tự'],
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
ClassSchema.index({ code: 1 });
ClassSchema.index({ teacher_id: 1 });
ClassSchema.index({ subject_ids: 1 });
ClassSchema.index({ grade_level: 1 });
ClassSchema.index({ is_active: 1 });
ClassSchema.virtual('available_slots').get(function () {
    return this.max_students - this.current_students;
});
ClassSchema.virtual('subjects', {
    ref: 'Subject',
    localField: 'subject_ids',
    foreignField: '_id',
    justOne: false,
});
ClassSchema.methods.addStudent = function () {
    if (this.current_students >= this.max_students) {
        throw new Error('Lớp đã đầy');
    }
    this.current_students += 1;
    return this.save();
};
ClassSchema.methods.removeStudent = function () {
    if (this.current_students > 0) {
        this.current_students -= 1;
    }
    return this.save();
};
ClassSchema.methods.isFull = function () {
    return this.current_students >= this.max_students;
};
ClassSchema.methods.addSubject = function (subjectId) {
    if (!this.subject_ids.find(x => x.toString() === subjectId.toString())) {
        this.subject_ids.push(subjectId);
    }
    return this.save();
};
ClassSchema.methods.removeSubject = function (subjectId) {
    this.subject_ids = this.subject_ids.filter(x => x.toString() !== subjectId.toString());
    return this.save();
};
ClassSchema.statics.findByTeacher = function (teacherId) {
    return this.find({ teacher_id: teacherId })
        .populate('subjects _id')
        .sort({ created_at: -1 });
};
ClassSchema.statics.findByGradeLevel = function (gradeLevel) {
    return this.find({ grade_level: gradeLevel, is_active: true })
        .populate('teacher_id')
        .populate('subjects')
        .sort({ code: 1 });
};
ClassSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
ClassSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Class = (0, mongoose_1.model)('Class', ClassSchema);
