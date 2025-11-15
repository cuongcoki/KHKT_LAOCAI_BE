"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const winston_1 = require("../helpers/winston");
const errorHandle_1 = require("../utils/errorHandle");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandle_1.UnauthorizedError('Vui lòng đăng nhập để truy cập');
        }
        if (!allowedRoles.includes(req.user.role)) {
            winston_1.logger.warn('Unauthorized access attempt', {
                userId: req.user.userId,
                role: req.user.role,
                allowedRoles,
                url: req.originalUrl,
            });
            throw new errorHandle_1.ForbiddenError(`Chỉ ${allowedRoles.join(', ')} mới có quyền truy cập`);
        }
        next();
    };
};
exports.authorize = authorize;
