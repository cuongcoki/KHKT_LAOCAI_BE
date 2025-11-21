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
const jwt_1 = require("../helpers/jwt");
const winston_1 = require("../helpers/winston");
const config_1 = __importDefault(require("../config"));
const errorHandle_1 = require("../utils/errorHandle");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthController {
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    throw new errorHandle_1.BadRequestError('Email và password là bắt buộc');
                }
                const user = yield User_1.User.findOne({ email }).select('+password');
                if (!user) {
                    throw new errorHandle_1.UnauthorizedError('Email hoặc password không đúng');
                }
                if (!user.is_active) {
                    throw new errorHandle_1.UnauthorizedError('Tài khoản đã bị khóa');
                }
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new errorHandle_1.UnauthorizedError('Email hoặc password không đúng');
                }
                const { accessToken, refreshToken } = yield jwt_1.jwtService.generateTokens(user.id, user.role);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: config_1.default.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                winston_1.logger.info(`User logged in: ${user.email}`);
                res.json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    data: {
                        accessToken,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            full_name: user.full_name,
                            avatar: user.avatar,
                        },
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    refreshAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                if (!refreshToken) {
                    throw new errorHandle_1.UnauthorizedError('Refresh token không tồn tại');
                }
                const newAccessToken = yield jwt_1.jwtService.refreshAccessToken(refreshToken);
                winston_1.logger.info('Access token refreshed');
                res.json({
                    success: true,
                    message: 'Làm mới token thành công',
                    data: {
                        accessToken: newAccessToken,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('refreshToken');
                winston_1.logger.info('User logged out');
                res.json({
                    success: true,
                    message: 'Đăng xuất thành công',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new AuthController();
