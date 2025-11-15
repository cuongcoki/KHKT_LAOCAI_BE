"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    WHITELIST_ORIGINS: ((_a = process.env.WHITELIST_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || [
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    defaultReslimit: 20,
    defaultResOffset: 0,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
};
exports.default = config;
