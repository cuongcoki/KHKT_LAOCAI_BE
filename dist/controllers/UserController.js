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
                    throw new errorHandle_1.BadRequestError('Username, email và password là bắt buộc');
                }
                const existingEmail = yield User_1.User.findOne({ email });
                if (existingEmail) {
                    throw new errorHandle_1.ConflictError('Email đã tồn tại');
                }
                const existingUsername = yield User_1.User.findOne({ username });
                if (existingUsername) {
                    throw new errorHandle_1.ConflictError('Username đã tồn tại');
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const user = yield User_1.User.create({
                    username,
                    email,
                    password: hashedPassword,
                    role: role || 'student',
                    full_name,
                    phone,
                });
                winston_1.logger.info(`User created: ${user.email}`);
                res.status(201).json({
                    success: true,
                    message: 'Tạo user thành công',
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
}
exports.default = new UserController();
