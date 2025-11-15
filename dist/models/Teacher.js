"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Teacher = void 0;
const mongoose_1 = require("mongoose");
const TeacherSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID là bắt buộc'],
        unique: true,
    },
    teacher_code: {
        type: String,
        required: [true, 'Mã giáo viên là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [
            /^GV[0-9]{4,6}$/,
            'Mã giáo viên phải có định dạng GV + 4-6 chữ số (VD: GV0001)',
        ],
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Tiểu sử tối đa 500 ký tự'],
    },
    avatar: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    specialization: {
        type: [String],
        required: [true, 'Chuyên môn là bắt buộc'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Phải có ít nhất một chuyên môn',
        },
        enum: {
            values: [
                'Toán',
                'Vật lý',
                'Hóa học',
                'Sinh học',
                'Ngữ văn',
                'Tiếng Anh',
                'Lịch sử',
                'Địa lý',
                'Giáo dục công dân',
                'Tin học',
                'Thể dục',
                'Công nghệ',
            ],
            message: '{VALUE} không phải là môn học hợp lệ',
        },
    },
    grade_levels_taught: {
        type: [Number],
        required: [true, 'Khối lớp giảng dạy là bắt buộc'],
        validate: {
            validator: function (v) {
                return v && v.length > 0 && v.every((grade) => grade >= 10 && grade <= 12);
            },
            message: 'Khối lớp phải từ 10 đến 12',
        },
    },
    school_name: {
        type: String,
        trim: true,
        maxlength: [200, 'Tên trường tối đa 200 ký tự'],
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    versionKey: false,
});
exports.Teacher = (0, mongoose_1.model)('Teacher', TeacherSchema);
