"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnership = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const jwt_1 = require("../helpers/jwt");
const winston_1 = require("../helpers/winston");
const errorHandle_1 = require("../utils/errorHandle");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandle_1.UnauthorizedError('Access token không tồn tại');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errorHandle_1.UnauthorizedError('Access token không tồn tại');
        }
        const payload = jwt_1.jwtService.verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            winston_1.logger.warn('Access token expired', {
                ip: req.ip,
                url: req.originalUrl,
            });
            throw new errorHandle_1.UnauthorizedError('Access token đã hết hạn');
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            winston_1.logger.warn('Invalid access token', {
                ip: req.ip,
                url: req.originalUrl,
            });
            throw new errorHandle_1.UnauthorizedError('Access token không hợp lệ');
        }
        if (error instanceof errorHandle_1.UnauthorizedError) {
            throw error;
        }
        winston_1.logger.error('Unexpected error during authentication:', error);
        throw new errorHandle_1.UnauthorizedError('Xác thực thất bại');
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const payload = jwt_1.jwtService.verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        winston_1.logger.debug('Optional auth - invalid token', { error });
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireOwnership = (paramName = 'userId', adminBypass = false) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandle_1.UnauthorizedError('Vui lòng đăng nhập để truy cập');
        }
        if (adminBypass && req.user.role === 'admin') {
            return next();
        }
        const resourceOwnerId = req.params[paramName];
        if (!resourceOwnerId) {
            throw new errorHandle_1.ForbiddenError('Resource ID không hợp lệ');
        }
        if (req.user.userId !== resourceOwnerId) {
            winston_1.logger.warn('Ownership check failed', {
                userId: req.user.userId,
                resourceOwnerId,
                url: req.originalUrl,
            });
            throw new errorHandle_1.ForbiddenError('Bạn không có quyền truy cập resource này');
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
exports.default = exports.authenticate;
