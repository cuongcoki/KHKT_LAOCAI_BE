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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("../helpers/winston");
const errorHandle_1 = require("../utils/errorHandle");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, role, full_name, phone } = req.body;
                if (!username || !email || !password) {
                    throw new errorHandle_1.BadRequestError("Username, email và password là bắt buộc");
                }
                const existingEmail = yield User_1.User.findOne({ email });
                if (existingEmail) {
                    throw new errorHandle_1.ConflictError("Email đã tồn tại");
                }
                const existingUsername = yield User_1.User.findOne({ username });
                if (existingUsername) {
                    throw new errorHandle_1.ConflictError("Username đã tồn tại");
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const user = yield User_1.User.create({
                    username,
                    email,
                    password: hashedPassword,
                    role: role || "student",
                    full_name,
                    phone,
                });
                winston_1.logger.info(`User created: ${user.email}`);
                res.status(201).json({
                    success: true,
                    message: "Tạo user thành công",
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        full_name: user.full_name,
                        phone: user.phone,
                        avatar: user.avatar,
                        is_active: user.is_active,
                        created_at: user.created_at,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllUsersByRoleTeacher(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield User_1.User.find({ role: "teacher" }).select("-password");
                res.status(200).json({
                    success: true,
                    message: "Lấy danh sách giáo viên thành công",
                    data: users,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUserName(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { full_name } = req.body;
                if (!full_name || full_name.trim() === "") {
                    throw new errorHandle_1.BadRequestError("Tên không được để trống");
                }
                const user = yield User_1.User.findById(id);
                if (!user) {
                    throw new errorHandle_1.NotFoundError("Không tìm thấy user");
                }
                user.full_name = full_name.trim();
                yield user.save();
                winston_1.logger.info(`User name updated: ${user.email} - New name: ${full_name}`);
                res.status(200).json({
                    success: true,
                    message: "Cập nhật tên thành công",
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        full_name: user.full_name,
                        phone: user.phone,
                        avatar: user.avatar,
                        is_active: user.is_active,
                        updated_at: user.updated_at,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, full_name, phone, role } = req.body;
                if (!username || !email || !password) {
                    throw new errorHandle_1.BadRequestError("Username, email và password là bắt buộc");
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new errorHandle_1.BadRequestError("Email không hợp lệ");
                }
                if (role && !["student", "teacher"].includes(role)) {
                    throw new errorHandle_1.BadRequestError('Role chỉ có thể là "student" hoặc "teacher"');
                }
                const existingEmail = yield User_1.User.findOne({ email });
                if (existingEmail) {
                    throw new errorHandle_1.ConflictError("Email đã tồn tại");
                }
                const existingUsername = yield User_1.User.findOne({ username });
                if (existingUsername) {
                    throw new errorHandle_1.ConflictError("Username đã tồn tại");
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const user = yield User_1.User.create({
                    username,
                    email,
                    password: hashedPassword,
                    role: role || "student",
                    full_name,
                    phone,
                    avatar: "default-avatar.png",
                    is_active: false,
                });
                winston_1.logger.info(`User registered as ${user.role} and waiting for approval: ${user.email}`);
                res.status(201).json({
                    success: true,
                    message: "Đăng ký thành công! Tài khoản của bạn đang chờ được phê duyệt.",
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        full_name: user.full_name,
                        is_active: user.is_active,
                        created_at: user.created_at,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    approveUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { action, rejection_reason } = req.body;
                if (!["approve", "reject"].includes(action)) {
                    throw new errorHandle_1.BadRequestError('Action phải là "approve" hoặc "reject"');
                }
                const user = yield User_1.User.findById(userId);
                if (!user) {
                    throw new errorHandle_1.NotFoundError("Không tìm thấy user");
                }
                if (user.is_active && action === "approve") {
                    throw new errorHandle_1.BadRequestError("Tài khoản đã được phê duyệt rồi");
                }
                if (action === "approve") {
                    user.is_active = true;
                    yield user.save();
                    winston_1.logger.info(`User approved by admin: ${user.email}`);
                    res.json({
                        success: true,
                        message: "Đã phê duyệt tài khoản thành công",
                        data: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            full_name: user.full_name,
                            phone: user.phone,
                            avatar: user.avatar,
                            is_active: user.is_active,
                            created_at: user.created_at,
                        },
                    });
                }
                else {
                    user.is_active = false;
                    yield user.save();
                    winston_1.logger.info(`User rejected by admin: ${user.email}, reason: ${rejection_reason}`);
                    res.json({
                        success: true,
                        message: "Đã từ chối tài khoản",
                        data: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            is_active: user.is_active,
                            created_at: user.created_at,
                        },
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkRegistrationStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.params;
                const user = yield User_1.User.findOne({ email }).select("-password");
                if (!user) {
                    throw new errorHandle_1.NotFoundError("Không tìm thấy tài khoản với email này");
                }
                let message = "";
                if (user.is_active) {
                    message = "Tài khoản đã được phê duyệt";
                }
                else {
                    message = "Tài khoản đang chờ phê duyệt";
                }
                res.json({
                    success: true,
                    message,
                    data: {
                        email: user.email,
                        username: user.username,
                        is_active: user.is_active,
                        created_at: user.created_at,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPendingUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10 } = req.query;
                const skip = (Number(page) - 1) * Number(limit);
                const [users, total] = yield Promise.all([
                    User_1.User.find({
                        is_active: false,
                        rejection_reason: { $exists: false },
                    })
                        .select("-password")
                        .sort({ created_at: -1 })
                        .skip(skip)
                        .limit(Number(limit)),
                    User_1.User.countDocuments({
                        is_active: false,
                        rejection_reason: { $exists: false },
                    }),
                ]);
                res.json({
                    success: true,
                    message: "Lấy danh sách user chờ duyệt thành công",
                    data: {
                        users: users.map((user) => ({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            full_name: user.full_name,
                            phone: user.phone,
                            avatar: user.avatar,
                            is_active: user.is_active,
                            created_at: user.created_at,
                        })),
                        pagination: {
                            total,
                            page: Number(page),
                            limit: Number(limit),
                            totalPages: Math.ceil(total / Number(limit)),
                        },
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new UserController();
