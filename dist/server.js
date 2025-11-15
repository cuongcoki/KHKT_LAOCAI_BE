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
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const configApp_1 = __importDefault(require("./config/configApp"));
const winston_1 = require("./helpers/winston");
const mongoose_1 = require("./database/mongoose");
console.log('🔥 BẮT ĐẦU KHỞI ĐỘNG SERVER...');
winston_1.logger.info('🔥 Logger hoạt động!');
const app = (0, express_1.default)();
console.log('✅ Đã khởi tạo Express app');
(0, configApp_1.default)(app);
console.log('✅ Đã config app');
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server đang hoạt động bình thường',
        timestamp: new Date().toISOString(),
        environment: config_1.default.NODE_ENV,
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route không tồn tại',
        path: req.originalUrl,
    });
});
app.use((err, req, res, next) => {
    winston_1.logger.error(`Error: ${err.message}`);
    if (config_1.default.NODE_ENV === 'development') {
        winston_1.logger.error(err.stack);
    }
    res.status(err.statusCode || 500).json(Object.assign({ success: false, message: err.message || 'Lỗi server nội bộ' }, (config_1.default.NODE_ENV === 'development' && { stack: err.stack })));
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔄 Đang kết nối database...');
        yield (0, mongoose_1.connectToDatabase)();
        console.log('✅ Đã kết nối database');
        const PORT = config_1.default.PORT;
        const server = app.listen(PORT, () => {
            console.log('='.repeat(50));
            winston_1.logger.info(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
            winston_1.logger.info(`🌍 Môi trường: ${config_1.default.NODE_ENV}`);
            winston_1.logger.info(`📝 Health check: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
        const handleShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
            winston_1.logger.warn(`\n🛑 Nhận tín hiệu ${signal}. Đang tắt server...`);
            server.close(() => __awaiter(void 0, void 0, void 0, function* () {
                winston_1.logger.info('✅ Đã đóng tất cả kết nối HTTP');
                try {
                    yield (0, mongoose_1.disconnectFromDatabase)();
                    winston_1.logger.info('✅ Server đã tắt hoàn toàn');
                    process.exit(0);
                }
                catch (error) {
                    winston_1.logger.error('❌ Lỗi khi tắt server:', error);
                    process.exit(1);
                }
            }));
            setTimeout(() => {
                winston_1.logger.error('⚠️  Không thể tắt server gracefully, buộc phải tắt');
                process.exit(1);
            }, 10000);
        });
        process.on('SIGTERM', () => handleShutdown('SIGTERM'));
        process.on('SIGINT', () => handleShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            winston_1.logger.error('❌ Uncaught Exception:', error);
            handleShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            winston_1.logger.error('❌ Unhandled Rejection tại:', promise, 'lý do:', reason);
            handleShutdown('unhandledRejection');
        });
    }
    catch (error) {
        winston_1.logger.error('❌ Lỗi khi khởi động server:', error);
        process.exit(1);
    }
});
console.log('🎬 Gọi startServer()...');
startServer();
exports.default = app;
