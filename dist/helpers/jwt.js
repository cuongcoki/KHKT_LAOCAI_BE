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
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
exports.jwtService = {
    generateTokens(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                userId: userId.toString(),
                role,
            };
            const [accessToken, refreshToken] = yield Promise.all([
                new Promise((resolve, reject) => {
                    jsonwebtoken_1.default.sign(payload, config_1.default.JWT_ACCESS_SECRET, { expiresIn: config_1.default.JWT_ACCESS_EXPIRE }, (err, token) => {
                        if (err || !token) {
                            reject(err || new Error('Failed to generate access token'));
                        }
                        else {
                            resolve(token);
                        }
                    });
                }),
                new Promise((resolve, reject) => {
                    jsonwebtoken_1.default.sign(payload, config_1.default.JWT_REFRESH_SECRET, { expiresIn: config_1.default.JWT_REFRESH_EXPIRE }, (err, token) => {
                        if (err || !token) {
                            reject(err || new Error('Failed to generate refresh token'));
                        }
                        else {
                            resolve(token);
                        }
                    });
                }),
            ]);
            return {
                accessToken,
                refreshToken,
            };
        });
    },
    generateAccessToken(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                userId: userId.toString(),
                role,
            };
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.default.sign(payload, config_1.default.JWT_ACCESS_SECRET, { expiresIn: config_1.default.JWT_ACCESS_EXPIRE }, (err, token) => {
                    if (err || !token) {
                        reject(err || new Error('Failed to generate access token'));
                    }
                    else {
                        resolve(token);
                    }
                });
            });
        });
    },
    generateRefreshToken(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                userId: userId.toString(),
                role,
            };
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.default.sign(payload, config_1.default.JWT_REFRESH_SECRET, { expiresIn: config_1.default.JWT_REFRESH_EXPIRE }, (err, token) => {
                    if (err || !token) {
                        reject(err || new Error('Failed to generate refresh token'));
                    }
                    else {
                        resolve(token);
                    }
                });
            });
        });
    },
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_ACCESS_SECRET);
            return decoded;
        }
        catch (error) {
            throw error;
        }
    },
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_REFRESH_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token đã hết hạn');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Refresh token không hợp lệ');
            }
            throw error;
        }
    },
    decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return decoded;
        }
        catch (error) {
            return null;
        }
    },
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp)
                return true;
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        catch (error) {
            return true;
        }
    },
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = this.verifyRefreshToken(refreshToken);
                const newAccessToken = yield this.generateAccessToken(decoded.userId, decoded.role);
                return newAccessToken;
            }
            catch (error) {
                throw new Error('Không thể refresh access token: ' + error.message);
            }
        });
    },
};
