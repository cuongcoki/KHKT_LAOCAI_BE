"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedErrorHandler = exports.handleJWTError = exports.handleCastError = exports.handleDuplicateKeyError = exports.handleMongooseValidationError = exports.notFoundHandler = exports.errorHandler = exports.formatErrorResponse = exports.asyncHandler = exports.validate = exports.ConflictError = exports.PayloadTooLargeError = exports.RequestValidationError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
const express_validator_1 = require("express-validator");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
class AppError extends Error {
    constructor(message, statusCode = httpStatus_1.default.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Yêu cầu không hợp lệ', errors) {
        super(message, httpStatus_1.default.BAD_REQUEST);
        this.errors = errors;
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Chưa xác thực') {
        super(message, httpStatus_1.default.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Bạn không có quyền truy cập') {
        super(message, httpStatus_1.default.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Không tìm thấy tài nguyên') {
        super(message, httpStatus_1.default.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class RequestValidationError extends AppError {
    constructor(message = 'Dữ liệu không hợp lệ', errors) {
        super(message, httpStatus_1.default.BAD_REQUEST);
        this.errors = errors;
    }
}
exports.RequestValidationError = RequestValidationError;
class PayloadTooLargeError extends AppError {
    constructor(message = 'Dung lượng file quá lớn') {
        super(message, httpStatus_1.default.Max_Payload_Size);
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
class ConflictError extends AppError {
    constructor(message = 'Xung đột dữ liệu') {
        super(message, httpStatus_1.default.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error) => ({
            field: error.type === 'field' ? error.path : undefined,
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined,
        }));
        const validationError = new RequestValidationError(`Lỗi validation dữ liệu `, formattedErrors);
        throw validationError;
    }
    next();
};
exports.validate = validate;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const formatErrorResponse = (error, includeStack = false) => {
    const response = {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
    };
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        response.errors = error.errors;
    }
    if (includeStack && error.stack) {
        response.stack = error.stack;
    }
    return response;
};
exports.formatErrorResponse = formatErrorResponse;
const errorHandler = (error, req, res, next) => {
    let appError;
    if (error instanceof AppError) {
        appError = error;
    }
    else {
        appError = new AppError(error.message || 'Lỗi server nội bộ', httpStatus_1.default.INTERNAL_SERVER_ERROR);
        appError.stack = error.stack;
    }
    console.error('❌ ERROR:', {
        message: appError.message,
        statusCode: appError.statusCode,
        stack: appError.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });
    const includeStack = process.env.NODE_ENV === 'development';
    const response = (0, exports.formatErrorResponse)(appError, includeStack);
    res.status(appError.statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    throw new NotFoundError(`Route ${req.originalUrl} không tồn tại`);
};
exports.notFoundHandler = notFoundHandler;
const handleMongooseValidationError = (error) => {
    const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
    }));
    return new RequestValidationError('Lỗi validation dữ liệu', errors);
};
exports.handleMongooseValidationError = handleMongooseValidationError;
const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new ConflictError(`${field} '${value}' đã tồn tại`);
};
exports.handleDuplicateKeyError = handleDuplicateKeyError;
const handleCastError = (error) => {
    return new BadRequestError(`${error.path} không hợp lệ: ${error.value}`);
};
exports.handleCastError = handleCastError;
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new UnauthorizedError('Token không hợp lệ');
    }
    if (error.name === 'TokenExpiredError') {
        return new UnauthorizedError('Token đã hết hạn');
    }
    return new UnauthorizedError('Xác thực thất bại');
};
exports.handleJWTError = handleJWTError;
const enhancedErrorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Lỗi server nội bộ';
    let errors = null;
    let stack = null;
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
        stack = error.stack;
    }
    else if (error.name === 'ValidationError') {
        const mongooseError = (0, exports.handleMongooseValidationError)(error);
        statusCode = mongooseError.statusCode;
        message = mongooseError.message;
        errors = mongooseError.errors;
    }
    else if (error.code === 11000) {
        const duplicateError = (0, exports.handleDuplicateKeyError)(error);
        statusCode = duplicateError.statusCode;
        message = duplicateError.message;
    }
    else if (error.name === 'CastError') {
        const castError = (0, exports.handleCastError)(error);
        statusCode = castError.statusCode;
        message = castError.message;
    }
    else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        const jwtError = (0, exports.handleJWTError)(error);
        statusCode = jwtError.statusCode;
        message = jwtError.message;
    }
    else {
        message = error.message || message;
        stack = error.stack;
    }
    console.error('❌ ERROR:', {
        statusCode,
        message,
        errors,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
    });
    const response = {
        success: false,
        message,
        statusCode,
    };
    if (errors) {
        response.errors = errors;
    }
    if (process.env.NODE_ENV === 'development' && stack) {
        response.stack = stack;
    }
    res.status(statusCode).json(response);
};
exports.enhancedErrorHandler = enhancedErrorHandler;
