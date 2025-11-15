/**
 * Node modules
 */
import { Server as HTTPServer } from "http";
import { Server, ServerOptions, Socket } from "socket.io";

/**
 * Config
 */
import config from "./index";
import { logger } from "../helpers/winston";
import { jwtService } from "@/helpers/jwt";

/**
 * Types
 */
interface SocketUser {
  userId: string;
  role: string;
  username?: string;
  full_name?: string;
}

interface OnlineUser {
  userId: string;
  socketId: string;
  username?: string;
  full_name?: string;
  role: string;
  connectedAt: Date;
  lastSeenAt?: Date;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

/**
 * Cấu hình Socket.IO options
 */
const socketOptions: Partial<ServerOptions> = {
  cors: {
    origin: config.WHITELIST_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
};

// Map để lưu online users
const onlineUsers = new Map<string, OnlineUser>();
// ✅ Map để lưu last seen của offline users
const lastSeenUsers = new Map<string, Date>();

// Biến để lưu io instance
let ioInstance: Server | null = null;

/**
 * Khởi tạo và cấu hình Socket.IO server
 */
export const configSocketIO = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, socketOptions);
  ioInstance = io;

  // ========================================
  // MIDDLEWARE - AUTHENTICATION
  // ========================================
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        if (config.NODE_ENV === "production") {
          logger.warn(`Socket connection rejected: No token provided`);
          return next(new Error("Authentication error"));
        }
        return next();
      }

      // Verify JWT token
      const decoded = jwtService.verifyAccessToken(
        token.replace("Bearer ", "")
      );

      // Lưu user info vào socket
      socket.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      logger.info(`Socket authenticated for user: ${decoded.userId}`);
      next();
    } catch (error) {
      logger.error("Socket authentication failed:", error);
      next(new Error("Authentication error"));
    }
  });

  // ========================================
  // CONNECTION HANDLER
  // ========================================
  io.on("connection", (socket: Socket) => {
    const userId = socket.user?.userId;

    logger.info(`✅ Client connected: ${socket.id}`);
    logger.info(`👥 Total clients: ${io.engine.clientsCount}`);

    if (userId) {
      // ✅ Lưu user vào online list
      onlineUsers.set(userId, {
        userId,
        socketId: socket.id,
        username: socket.user?.username,
        full_name: socket.user?.full_name,
        role: socket.user?.role || "student",
        connectedAt: new Date(),
        lastSeenAt: new Date(),
      });

      // ✅ Remove from lastSeen khi user online
      lastSeenUsers.delete(userId);

      // Join room của user
      socket.join(`user:${userId}`);

      logger.info(`User ${userId} joined room`);

      // ✅ Broadcast user online status
      socket.broadcast.emit("user:online", {
        userId,
        username: socket.user?.username,
        full_name: socket.user?.full_name,
        role: socket.user?.role,
      });

      // ✅ Gửi danh sách online users cho user mới connect
          socket.emit('users:online-list', {
      users: Array.from(onlineUsers.values()).map((user) => ({
        userId: user.userId,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        isOnline: true,
        lastSeenAt: user.lastSeenAt,
      })),
      lastSeenUsers: Array.from(lastSeenUsers.entries()).map(([userId, lastSeenAt]) => ({
        userId,
        lastSeenAt,
      })),
    });
  }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    /**
     * ✅ Request online users list
     */
    socket.on('users:get-online', () => {
    socket.emit('users:online-list', {
      users: Array.from(onlineUsers.values()).map((user) => ({
        userId: user.userId,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        isOnline: true,
        lastSeenAt: user.lastSeenAt,
      })),
      lastSeenUsers: Array.from(lastSeenUsers.entries()).map(([userId, lastSeenAt]) => ({
        userId,
        lastSeenAt,
      })),
    });
  });

  
    /**
     * Mark notification as read
     */
    socket.on("notification:read", (data: { notificationId: string }) => {
      logger.info(
        `User ${userId} marked notification ${data.notificationId} as read`
      );
    });

    /**
     * Request notification count
     */
    socket.on("notification:get-count", () => {
      logger.info(`User ${userId} requested notification count`);
    });

    /**
     * Typing indicator
     */
    socket.on("typing:start", (data: { roomId: string }) => {
      if (userId) {
        socket.to(data.roomId).emit("typing:start", { userId });
      }
    });

    socket.on("typing:stop", (data: { roomId: string }) => {
      if (userId) {
        socket.to(data.roomId).emit("typing:stop", { userId });
      }
    });

    /**
   * ✅ Request last seen của specific user
   */
  socket.on('user:get-last-seen', (data: { userId: string }) => {
    const onlineUser = onlineUsers.get(data.userId);
    const lastSeen = lastSeenUsers.get(data.userId);

    socket.emit('user:last-seen', {
      userId: data.userId,
      isOnline: !!onlineUser,
      lastSeenAt: onlineUser?.lastSeenAt || lastSeen,
    });
  });


  

    // ========================================
    // DISCONNECT HANDLER
    // ========================================
   socket.on('disconnect', (reason) => {
    if (userId) {
      // ✅ Lưu last seen trước khi remove
      const now = new Date();
      lastSeenUsers.set(userId, now);

      // Remove user from online list
      onlineUsers.delete(userId);

      // ✅ Broadcast user offline với lastSeenAt
      socket.broadcast.emit('user:offline', {
        userId,
        username: socket.user?.username,
        full_name: socket.user?.full_name,
        lastSeenAt: now,
      });

      logger.info(`User ${userId} disconnected`);
    }

    logger.warn(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
    logger.info(`👥 Total clients: ${io.engine.clientsCount}`);
  });

  // Error handler
  socket.on('error', (error) => {
    logger.error(`Socket error from ${socket.id}:`, error);
  });
});




  // ========================================
  // SERVER-LEVEL ERROR HANDLER
  // ========================================
  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", err);
  });

  logger.info("✅ Socket.IO server đã được cấu hình thành công");

  return io;
};


/**
 * ✅ Get last seen của user
 */
export const getLastSeen = (userId: string): Date | undefined => {
  const onlineUser = onlineUsers.get(userId);
  if (onlineUser) {
    return onlineUser.lastSeenAt;
  }
  return lastSeenUsers.get(userId);
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get Socket.IO instance
 */
export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.IO chưa được khởi tạo");
  }
  return ioInstance;
};

/**
 * Emit notification to specific user
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!ioInstance) {
    logger.warn("Socket.IO chưa được khởi tạo");
    return;
  }

  ioInstance.to(`user:${userId}`).emit(event, data);
  logger.info(`Emitted ${event} to user ${userId}`);
};




/**
 * Emit notification to multiple users
 */
export const emitToUsers = (userIds: string[], event: string, data: any) => {
  if (!ioInstance) {
    logger.warn("Socket.IO chưa được khởi tạo");
    return;
  }

  userIds.forEach((userId) => {
    ioInstance!.to(`user:${userId}`).emit(event, data);
  });

  logger.info(`Emitted ${event} to ${userIds.length} users`);
};

/**
 * Broadcast to all connected users
 */
export const broadcastToAll = (event: string, data: any) => {
  if (!ioInstance) {
    logger.warn("Socket.IO chưa được khởi tạo");
    return;
  }

  ioInstance.emit(event, data);
  logger.info(`Broadcasted ${event} to all users`);
};

/**
 * ✅ Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

/**
 * ✅ Get all online users
 */
export const getOnlineUsers = (): OnlineUser[] => {
  return Array.from(onlineUsers.values());
};

/**
 * ✅ Get online users count
 */
export const getOnlineUsersCount = (): number => {
  return onlineUsers.size;
};

/**
 * Get socket ID by user ID
 */
export const getSocketIdByUserId = (userId: string): string | undefined => {
  return onlineUsers.get(userId)?.socketId;
};

export default configSocketIO;
