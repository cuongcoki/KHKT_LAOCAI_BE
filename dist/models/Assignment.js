"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = require("mongoose");
const AttachmentSchema = new mongoose_1.Schema({
    filename: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    size: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        required: true,
    },
}, { _id: false });
const AssignmentSchema = new mongoose_1.Schema({
    class_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Class ID là bắt buộc'],
    },
    code: {
        type: String,
        required: [true, 'Mã bài tập là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [
            /^BT[0-9]{4,6}$/,
            'Mã bài tập phải có định dạng BT + 4-6 chữ số (VD: BT0001)',
        ],
    },
    title: {
        type: String,
        required: [true, 'Tiêu đề bài tập là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [5000, 'Mô tả tối đa 5000 ký tự'],
    },
    subject_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject ID là bắt buộc'],
    },
    due_date: {
        type: Date,
        required: [true, 'Hạn nộp là bắt buộc'],
        validate: {
            validator: function (value) {
                if (this.isNew) {
                    return value > new Date();
                }
                return true;
            },
            message: 'Hạn nộp phải sau thời điểm hiện tại',
        },
    },
    max_score: {
        type: Number,
        required: [true, 'Điểm tối đa là bắt buộc'],
        min: [0, 'Điểm tối đa phải lớn hơn 0'],
        max: [100, 'Điểm tối đa không được vượt quá 100'],
        default: 10,
    },
    total_submitted: {
        type: Number,
        default: 0,
        min: [0, 'Số bài đã nộp không hợp lệ'],
    },
    total_unsubmitted: {
        type: Number,
        default: 0,
        min: [0, 'Số bài chưa nộp không hợp lệ'],
    },
    passing_score: {
        type: Number,
        required: [true, 'Điểm đạt là bắt buộc'],
        min: [0, 'Điểm đạt phải lớn hơn hoặc bằng 0'],
        validate: {
            validator: function (value) {
                return value <= this.max_score;
            },
            message: 'Điểm đạt không được vượt quá điểm tối đa',
        },
    },
    attachments: {
        type: [AttachmentSchema],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Không được đính kèm quá 10 files',
        },
    },
    auto_grade_enabled: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
AssignmentSchema.index({ class_id: 1 });
AssignmentSchema.index({ subject_id: 1 });
AssignmentSchema.index({ code: 1 });
AssignmentSchema.index({ due_date: 1 });
AssignmentSchema.index({ created_at: -1 });
AssignmentSchema.index({ title: 'text', description: 'text' });
AssignmentSchema.virtual('total_assignments').get(function () {
    return this.total_submitted + this.total_unsubmitted;
});
AssignmentSchema.virtual('completion_rate').get(function () {
    const total = this.total_submitted + this.total_unsubmitted;
    if (total === 0)
        return 0;
    return Math.round((this.total_submitted / total) * 100);
});
AssignmentSchema.virtual('days_until_due').get(function () {
    const now = new Date();
    const diff = this.due_date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
AssignmentSchema.virtual('class', {
    ref: 'Class',
    localField: 'class_id',
    foreignField: '_id',
    justOne: true,
});
AssignmentSchema.virtual('subject', {
    ref: 'Subject',
    localField: 'subject_id',
    foreignField: '_id',
    justOne: true,
});
AssignmentSchema.methods.incrementSubmitted = function () {
    this.total_submitted += 1;
    if (this.total_unsubmitted > 0) {
        this.total_unsubmitted -= 1;
    }
    return this.save();
};
AssignmentSchema.methods.decrementSubmitted = function () {
    if (this.total_submitted > 0) {
        this.total_submitted -= 1;
        this.total_unsubmitted += 1;
    }
    return this.save();
};
AssignmentSchema.methods.getSubmissionRate = function () {
    const total = this.total_submitted + this.total_unsubmitted;
    if (total === 0)
        return 0;
    return (this.total_submitted / total) * 100;
};
AssignmentSchema.methods.isPastDue = function () {
    return new Date() > this.due_date;
};
AssignmentSchema.methods.canAutoGrade = function () {
    return this.auto_grade_enabled;
};
AssignmentSchema.statics.findByClass = function (classId, options) {
    const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
    return this.find({ class_id: classId })
        .sort({ due_date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('subject_id');
};
AssignmentSchema.statics.findBySubject = function (subjectId, options) {
    const page = (options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = (options === null || options === void 0 ? void 0 : options.limit) || 20;
    return this.find({ subject_id: subjectId })
        .sort({ due_date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('class_id');
};
AssignmentSchema.statics.getUpcoming = function (classId, days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.find({
        class_id: classId,
        due_date: { $gte: now, $lte: futureDate },
    }).sort({ due_date: 1 });
};
AssignmentSchema.statics.getPastDue = function (classId) {
    return this.find({
        class_id: classId,
        due_date: { $lt: new Date() },
    }).sort({ due_date: -1 });
};
AssignmentSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
AssignmentSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        return ret;
    },
});
exports.Assignment = (0, mongoose_1.model)('Assignment', AssignmentSchema);
