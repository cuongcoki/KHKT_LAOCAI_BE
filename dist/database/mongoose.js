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
exports.disconnectFromDatabase = exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const winston_1 = require("../helpers/winston");
const clientOptions = {
    dbName: 'lms-database',
    appName: 'LMS Backend API',
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    },
};
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!config_1.default.MONGO_URI) {
        throw new Error('MONGO_URI không được định nghĩa trong cấu hình.');
    }
    try {
        yield mongoose_1.default.connect(config_1.default.MONGO_URI, clientOptions);
        winston_1.logger.info('✅ Kết nối database thành công', {
            dbName: clientOptions.dbName,
            appName: clientOptions.appName,
        });
    }
    catch (error) {
        winston_1.logger.error('❌ Lỗi khi kết nối database:', error);
        if (error instanceof Error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
        throw error;
    }
});
exports.connectToDatabase = connectToDatabase;
const disconnectFromDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.disconnect();
        winston_1.logger.info('✅ Đã ngắt kết nối database thành công');
    }
    catch (error) {
        winston_1.logger.error('❌ Lỗi khi ngắt kết nối database:', error);
        if (error instanceof Error) {
            throw new Error(`Database disconnection failed: ${error.message}`);
        }
        throw error;
    }
});
exports.disconnectFromDatabase = disconnectFromDatabase;
