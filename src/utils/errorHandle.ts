/**
 * Node modules
 */
import { validationResult, ValidationError as ExpressValidationError, Result } from 'express-validator';

/**
 * Custom modules
 */
import HttpStatus from '@/constants/httpStatus';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

/**
 * Custom Error Class - Base Error
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Yêu cầu không hợp lệ', errors?: any) {
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Chưa xác thực') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền truy cập') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy tài nguyên') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Request Validation Error (400)
 * Đổi tên từ ValidationError thành RequestValidationError
 */
export class RequestValidationError extends AppError {
  constructor(message: string = 'Dữ liệu không hợp lệ', errors?: any) {
    super(message, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}

/**
 * Payload Too Large Error (413)
 */
export class PayloadTooLargeError extends AppError {
  constructor(message: string = 'Dung lượng file quá lớn') {
    super(message, HttpStatus.Max_Payload_Size);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Xung đột dữ liệu') {
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * Middleware để validate request với express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors: Result<ExpressValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : undefined,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    // // Log để debug
    // console.log('❌ Validation errors:', formattedErrors);

    // Throw error với chi tiết
    const validationError = new RequestValidationError(
    `Lỗi validation dữ liệu `, formattedErrors
    );
    
    throw validationError;
  }

  next();
};

/**
 * Wrapper cho async functions để tự động catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Format error response
 */
/**
 * Format error response
 */
export const formatErrorResponse = (error: AppError, includeStack: boolean = false) => {
  const response: any = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  };

  // ✅ LUÔN thêm errors nếu có (quan trọng!)
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Chỉ include stack trace trong development
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = new AppError(
      error.message || 'Lỗi server nội bộ',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    appError.stack = error.stack;
  }

  // Log error
  console.error('❌ ERROR:', {
    message: appError.message,
    statusCode: appError.statusCode,
    stack: appError.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Send response
  const includeStack = process.env.NODE_ENV === 'development';
  const response = formatErrorResponse(appError, includeStack);

  res.status(appError.statusCode).json(response);
};

/**
 * Handle 404 Not Found
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError(`Route ${req.originalUrl} không tồn tại`);
};

/**
 * Handle Mongoose Validation Error
 */
export const handleMongooseValidationError = (error: any): AppError => {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));

  return new RequestValidationError('Lỗi validation dữ liệu', errors);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
export const handleDuplicateKeyError = (error: any): AppError => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return new ConflictError(`${field} '${value}' đã tồn tại`);
};

/**
 * Handle Mongoose Cast Error
 */
export const handleCastError = (error: any): AppError => {
  return new BadRequestError(`${error.path} không hợp lệ: ${error.value}`);
};

/**
 * Handle JWT Errors
 */
export const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Token không hợp lệ');
  }
  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token đã hết hạn');
  }
  return new UnauthorizedError('Xác thực thất bại');
};

/**
 * Enhanced Error Handler với MongoDB errors
 */
export const enhancedErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Lỗi server nội bộ';
  let errors: any = null;
  let stack: any = null;

  // Handle các loại errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
    stack = error.stack;
  } else if (error.name === 'ValidationError') {
    const mongooseError = handleMongooseValidationError(error);
    statusCode = mongooseError.statusCode;
    message = mongooseError.message;
    errors = mongooseError.errors;
  } else if (error.code === 11000) {
    const duplicateError = handleDuplicateKeyError(error);
    statusCode = duplicateError.statusCode;
    message = duplicateError.message;
  } else if (error.name === 'CastError') {
    const castError = handleCastError(error);
    statusCode = castError.statusCode;
    message = castError.message;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const jwtError = handleJWTError(error);
    statusCode = jwtError.statusCode;
    message = jwtError.message;
  } else {
    message = error.message || message;
    stack = error.stack;
  }

  // Log error
  console.error('❌ ERROR:', {
    statusCode,
    message,
    errors,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  // Build response
  const response: any = {
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