/**
 * Node modules
 */
import express from 'express';
import { createServer } from 'http';

/**
 * Config & Setup
 */
import config from './config';
import configApp from './config/configApp';
import configSocketIO from './config/configSocketIO';
import { logger } from './helpers/winston';

/**
 * Database
 */
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose';
/**
 * Routes
 */
import publicRouter from './routes/public';
import privateRouter from './routes/private';

/**
 * Middlewares
 */
import authenticate from './middlewares/authenticate';

import {
  enhancedErrorHandler, // ← Import đúng cái này
  notFoundHandler,
} from './utils/errorHandle';

// TEST LOG NGAY TỪ ĐẦU
console.log('🔥 BẮT ĐẦU KHỞI ĐỘNG SERVER...');
logger.info('🔥 Logger hoạt động!');

// ========================================
// KHỞI TẠO EXPRESS APP & HTTP SERVER
// ========================================
const app = express();
const httpServer = createServer(app);
console.log('✅ Đã khởi tạo Express app');

// ========================================
// CẤU HÌNH MIDDLEWARE
// ========================================
configApp(app);
console.log('✅ Đã config app');

// ========================================
// CẤU HÌNH SOCKET.IO
// ========================================
export const io = configSocketIO(httpServer);
console.log('✅ Đã config Socket.IO');

// ========================================
// ROUTES
// ========================================

// ** Public API here
app.use("/api/public", publicRouter);

// ** Private API here
app.use("/api/*", authenticate);

app.use("/api/private", privateRouter);

// 404 Handler
app.use(notFoundHandler);

// ✅ Dùng enhancedErrorHandler
app.use(enhancedErrorHandler); // ← Không phải errorHandler

// ========================================



// Route không tồn tại (404)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route không tồn tại',
    path: req.originalUrl,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(`Error: ${err.message}`);
    
    if (config.NODE_ENV === 'development') {
      logger.error(err.stack);
    }

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Lỗi server nội bộ',
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

// ========================================
// KHỞI ĐỘNG SERVER
// ========================================
const startServer = async () => {
  try {
    console.log('🔄 Đang kết nối database...');
    
    // Kết nối database
    await connectToDatabase();
    
    console.log('✅ Đã kết nối database');

    // Khởi động server
    const PORT = config.PORT;

    httpServer.listen(PORT, () => {
      console.log('='.repeat(50));
      logger.info(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
      logger.info(`🌍 Môi trường: ${config.NODE_ENV}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔌 Socket.IO ready`);
      logger.info(`🧪 Test endpoints:`);
      logger.info(`   - GET  /test/socket/broadcast?message=Hello`);
      logger.info(`   - POST /test/socket/room`);
      logger.info(`   - POST /test/socket/notify`);
      logger.info(`   - GET  /test/socket/rooms`);
      console.log('='.repeat(50));
    });

    // ========================================
    // GRACEFUL SHUTDOWN
    // ========================================
    
    const handleShutdown = async (signal: string) => {
      logger.warn(`\n🛑 Nhận tín hiệu ${signal}. Đang tắt server...`);

      io.close(() => {
        logger.info('✅ Đã đóng tất cả Socket.IO connections');
      });

      httpServer.close(async () => {
        logger.info('✅ Đã đóng tất cả kết nối HTTP');

        try {
          await disconnectFromDatabase();
          logger.info('✅ Server đã tắt hoàn toàn');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Lỗi khi tắt server:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('⚠️  Không thể tắt server gracefully, buộc phải tắt');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      logger.error('❌ Uncaught Exception:', error);
      handleShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection:', reason);
      logger.error('❌ Unhandled Rejection tại:', promise, 'lý do:', reason);
      handleShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ LỖI KHI KHỞI ĐỘNG SERVER:', error);
    logger.error('❌ Lỗi khi khởi động server:', error);
    process.exit(1);
  }
};

// Bắt đầu server
console.log('🎬 Gọi startServer()...');
startServer();

export default app;