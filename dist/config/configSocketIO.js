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
exports.getSocketIdByUserId = exports.getOnlineUsersCount = exports.getOnlineUsers = exports.isUserOnline = exports.broadcastToAll = exports.emitToUsers = exports.emitToUser = exports.getIO = exports.getLastSeen = exports.configSocketIO = void 0;
const socket_io_1 = require("socket.io");
const index_1 = __importDefault(require("./index"));
const winston_1 = require("../helpers/winston");
const jwt_1 = require("../helpers/jwt");
const socketOptions = {
    cors: {
        origin: index_1.default.WHITELIST_ORIGINS,
        credentials: true,
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
};
const onlineUsers = new Map();
const lastSeenUsers = new Map();
let ioInstance = null;
const configSocketIO = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, socketOptions);
    ioInstance = io;
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
            if (!token) {
                if (index_1.default.NODE_ENV === "production") {
                    winston_1.logger.warn(`Socket connection rejected: No token provided`);
                    return next(new Error("Authentication error"));
                }
                return next();
            }
            const decoded = jwt_1.jwtService.verifyAccessToken(token.replace("Bearer ", ""));
            socket.user = {
                userId: decoded.userId,
                role: decoded.role,
            };
            winston_1.logger.info(`Socket authenticated for user: ${decoded.userId}`);
            next();
        }
        catch (error) {
            winston_1.logger.error("Socket authentication failed:", error);
            next(new Error("Authentication error"));
        }
    }));
    io.on("connection", (socket) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const userId = (_a = socket.user) === null || _a === void 0 ? void 0 : _a.userId;
        winston_1.logger.info(`✅ Client connected: ${socket.id}`);
        winston_1.logger.info(`👥 Total clients: ${io.engine.clientsCount}`);
        if (userId) {
            onlineUsers.set(userId, {
                userId,
                socketId: socket.id,
                username: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.username,
                full_name: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.full_name,
                role: ((_d = socket.user) === null || _d === void 0 ? void 0 : _d.role) || "student",
                connectedAt: new Date(),
                lastSeenAt: new Date(),
            });
            lastSeenUsers.delete(userId);
            socket.join(`user:${userId}`);
            winston_1.logger.info(`User ${userId} joined room`);
            socket.broadcast.emit("user:online", {
                userId,
                username: (_e = socket.user) === null || _e === void 0 ? void 0 : _e.username,
                full_name: (_f = socket.user) === null || _f === void 0 ? void 0 : _f.full_name,
                role: (_g = socket.user) === null || _g === void 0 ? void 0 : _g.role,
            });
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
        socket.on("notification:read", (data) => {
            winston_1.logger.info(`User ${userId} marked notification ${data.notificationId} as read`);
        });
        socket.on("notification:get-count", () => {
            winston_1.logger.info(`User ${userId} requested notification count`);
        });
        socket.on("typing:start", (data) => {
            if (userId) {
                socket.to(data.roomId).emit("typing:start", { userId });
            }
        });
        socket.on("typing:stop", (data) => {
            if (userId) {
                socket.to(data.roomId).emit("typing:stop", { userId });
            }
        });
        socket.on('user:get-last-seen', (data) => {
            const onlineUser = onlineUsers.get(data.userId);
            const lastSeen = lastSeenUsers.get(data.userId);
            socket.emit('user:last-seen', {
                userId: data.userId,
                isOnline: !!onlineUser,
                lastSeenAt: (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.lastSeenAt) || lastSeen,
            });
        });
        socket.on('disconnect', (reason) => {
            var _a, _b;
            if (userId) {
                const now = new Date();
                lastSeenUsers.set(userId, now);
                onlineUsers.delete(userId);
                socket.broadcast.emit('user:offline', {
                    userId,
                    username: (_a = socket.user) === null || _a === void 0 ? void 0 : _a.username,
                    full_name: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.full_name,
                    lastSeenAt: now,
                });
                winston_1.logger.info(`User ${userId} disconnected`);
            }
            winston_1.logger.warn(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
            winston_1.logger.info(`👥 Total clients: ${io.engine.clientsCount}`);
        });
        socket.on('error', (error) => {
            winston_1.logger.error(`Socket error from ${socket.id}:`, error);
        });
    });
    io.engine.on("connection_error", (err) => {
        winston_1.logger.error("Socket.IO connection error:", err);
    });
    winston_1.logger.info("✅ Socket.IO server đã được cấu hình thành công");
    return io;
};
exports.configSocketIO = configSocketIO;
const getLastSeen = (userId) => {
    const onlineUser = onlineUsers.get(userId);
    if (onlineUser) {
        return onlineUser.lastSeenAt;
    }
    return lastSeenUsers.get(userId);
};
exports.getLastSeen = getLastSeen;
const getIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO chưa được khởi tạo");
    }
    return ioInstance;
};
exports.getIO = getIO;
const emitToUser = (userId, event, data) => {
    if (!ioInstance) {
        winston_1.logger.warn("Socket.IO chưa được khởi tạo");
        return;
    }
    ioInstance.to(`user:${userId}`).emit(event, data);
    winston_1.logger.info(`Emitted ${event} to user ${userId}`);
};
exports.emitToUser = emitToUser;
const emitToUsers = (userIds, event, data) => {
    if (!ioInstance) {
        winston_1.logger.warn("Socket.IO chưa được khởi tạo");
        return;
    }
    userIds.forEach((userId) => {
        ioInstance.to(`user:${userId}`).emit(event, data);
    });
    winston_1.logger.info(`Emitted ${event} to ${userIds.length} users`);
};
exports.emitToUsers = emitToUsers;
const broadcastToAll = (event, data) => {
    if (!ioInstance) {
        winston_1.logger.warn("Socket.IO chưa được khởi tạo");
        return;
    }
    ioInstance.emit(event, data);
    winston_1.logger.info(`Broadcasted ${event} to all users`);
};
exports.broadcastToAll = broadcastToAll;
const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
const getOnlineUsers = () => {
    return Array.from(onlineUsers.values());
};
exports.getOnlineUsers = getOnlineUsers;
const getOnlineUsersCount = () => {
    return onlineUsers.size;
};
exports.getOnlineUsersCount = getOnlineUsersCount;
const getSocketIdByUserId = (userId) => {
    var _a;
    return (_a = onlineUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.socketId;
};
exports.getSocketIdByUserId = getSocketIdByUserId;
exports.default = exports.configSocketIO;
