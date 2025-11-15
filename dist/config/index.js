"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const getEnvVar_1 = __importDefault(require("../helpers/getEnvVar"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: (0, getEnvVar_1.default)('MONGO_URI', 'mongodb://localhost:27017/lms-database'),
    WHITELIST_ORIGINS: ((_a = process.env.WHITELIST_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://14.225.211.7:8333'
    ],
    HOST: process.env.HOST || '0.0.0.0',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    defaultReslimit: 20,
    defaultResOffset: 0,
    JWT_ACCESS_SECRET: (0, getEnvVar_1.default)('JWT_ACCESS_SECRET', 'default-access-secret-change-in-production'),
    JWT_REFRESH_SECRET: (0, getEnvVar_1.default)('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
    JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};
exports.default = config;
