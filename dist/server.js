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
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const config_1 = __importDefault(require("./config"));
const configApp_1 = __importDefault(require("./config/configApp"));
const configSocketIO_1 = __importDefault(require("./config/configSocketIO"));
const winston_1 = require("./helpers/winston");
const mongoose_1 = require("./database/mongoose");
const public_1 = __importDefault(require("./routes/public"));
const private_1 = __importDefault(require("./routes/private"));
const authenticate_1 = __importDefault(require("./middlewares/authenticate"));
const errorHandle_1 = require("./utils/errorHandle");
console.log("🔥 BẮT ĐẦU KHỞI ĐỘNG SERVER...");
winston_1.logger.info("🔥 Logger hoạt động!");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
console.log("✅ Đã khởi tạo Express app");
(0, configApp_1.default)(app);
console.log("✅ Đã config app");
exports.io = (0, configSocketIO_1.default)(httpServer);
console.log("✅ Đã config Socket.IO");
app.use("/api/public", public_1.default);
app.use("/api/*", authenticate_1.default);
app.use("/api/private", private_1.default);
app.use(errorHandle_1.notFoundHandler);
app.use(errorHandle_1.enhancedErrorHandler);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔄 Đang kết nối database...");
        yield (0, mongoose_1.connectToDatabase)();
        console.log("✅ Đã kết nối database");
        const PORT = config_1.default.PORT;
        const HOST = config_1.default.HOST || "0.0.0.0";
        httpServer.listen(PORT, HOST, () => {
            console.log('='.repeat(50));
            if (config_1.default.NODE_ENV === 'development') {
                winston_1.logger.info(`🚀 Server: http://localhost:${PORT}`);
            }
            else {
                winston_1.logger.info(`🚀 Server đang chạy tại PORT: ${PORT}`);
                winston_1.logger.info(`🌐 HOST: ${HOST}`);
            }
            winston_1.logger.info(`🌍 Môi trường: ${config_1.default.NODE_ENV}`);
            winston_1.logger.info(`🔌 Socket.IO ready`);
            console.log('='.repeat(50));
        });
        const handleShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
            winston_1.logger.warn(`\n🛑 Nhận tín hiệu ${signal}. Đang tắt server...`);
            exports.io.close(() => {
                winston_1.logger.info("✅ Đã đóng tất cả Socket.IO connections");
            });
            httpServer.close(() => __awaiter(void 0, void 0, void 0, function* () {
                winston_1.logger.info("✅ Đã đóng tất cả kết nối HTTP");
                try {
                    yield (0, mongoose_1.disconnectFromDatabase)();
                    winston_1.logger.info("✅ Server đã tắt hoàn toàn");
                    process.exit(0);
                }
                catch (error) {
                    winston_1.logger.error("❌ Lỗi khi tắt server:", error);
                    process.exit(1);
                }
            }));
            setTimeout(() => {
                winston_1.logger.error("⚠️  Không thể tắt server gracefully, buộc phải tắt");
                process.exit(1);
            }, 10000);
        });
        process.on("SIGTERM", () => handleShutdown("SIGTERM"));
        process.on("SIGINT", () => handleShutdown("SIGINT"));
        process.on("uncaughtException", (error) => {
            console.error("❌ Uncaught Exception:", error);
            winston_1.logger.error("❌ Uncaught Exception:", error);
            handleShutdown("uncaughtException");
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("❌ Unhandled Rejection:", reason);
            winston_1.logger.error("❌ Unhandled Rejection tại:", promise, "lý do:", reason);
            handleShutdown("unhandledRejection");
        });
    }
    catch (error) {
        console.error("❌ LỖI KHI KHỞI ĐỘNG SERVER:", error);
        winston_1.logger.error("❌ Lỗi khi khởi động server:", error);
        process.exit(1);
    }
});
console.log("🎬 Gọi startServer()...");
startServer();
exports.default = app;
