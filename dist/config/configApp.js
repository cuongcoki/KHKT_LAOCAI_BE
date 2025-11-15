"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const _1 = __importDefault(require("."));
const express_rate_limit_1 = __importDefault(require("../helpers/express_rate_limit"));
const winston_1 = require("../helpers/winston");
const configApp = (app) => {
    const corsOptions = {
        origin(origin, callback) {
            if (_1.default.NODE_ENV === "development" ||
                !origin ||
                _1.default.WHITELIST_ORIGINS.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS error: ${origin} không được phép truy cập`), false);
                winston_1.logger.warn(`CORS error: ${origin} không được phép truy cập`);
            }
        },
        credentials: true,
    };
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, compression_1.default)({
        threshold: 1024,
        level: 6,
    }));
    app.use((0, helmet_1.default)());
    app.use(express_rate_limit_1.default);
    app.use((req, res, next) => {
        winston_1.logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
        next();
    });
    winston_1.logger.info("✅ Đã cấu hình tất cả middleware thành công");
};
exports.default = configApp;
