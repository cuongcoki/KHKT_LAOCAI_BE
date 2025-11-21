"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Username là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username phải có ít nhất 3 ký tự'],
        maxlength: [50, 'Username tối đa 50 ký tự'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
        ],
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email tối đa 100 ký tự'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Email không hợp lệ',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password là bắt buộc'],
        minlength: [6, 'Password phải có ít nhất 6 ký tự'],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'teacher', 'student'],
            message: '{VALUE} không phải là role hợp lệ',
        },
        default: 'student',
    },
    full_name: {
        type: String,
        trim: true,
        maxlength: [100, 'Họ tên tối đa 100 ký tự'],
    },
    avatar: {
        type: String,
        default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            'Số điện thoại không hợp lệ',
        ],
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
exports.User = (0, mongoose_1.model)('User', UserSchema);
