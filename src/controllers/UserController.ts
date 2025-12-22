/**
 * Custom modules
 */
import { jwtService } from "@/helpers/jwt";
import { logger } from "../helpers/winston";
import config from "../config";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../utils/errorHandle";

/**
 * Models
 */
import { User } from "../models/User";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

class UserController {
  /**
   * Create User - Tạo user mới
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role, full_name, phone } = req.body;

      // Validate input
      if (!username || !email || !password) {
        throw new BadRequestError("Username, email và password là bắt buộc");
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new ConflictError("Email đã tồn tại");
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new ConflictError("Username đã tồn tại");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || "student",
        full_name,
        phone,
      });

      logger.info(`User created: ${user.email}`);

      // Return user info (không trả password)
      res.status(201).json({
        success: true,
        message: "Tạo user thành công",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          avatar: user.avatar,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsersByRoleTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({ role: "teacher" }).select("-password");
      res.status(200).json({
        success: true,
        message: "Lấy danh sách giáo viên thành công",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update User Name - Cập nhật tên user
   */
  /**
   * Update User Name - Cập nhật tên user theo ID
   */
  async updateUserName(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { full_name } = req.body;

      // Validate input
      if (!full_name || full_name.trim() === "") {
        throw new BadRequestError("Tên không được để trống");
      }

      // Tìm user theo ID
      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError("Không tìm thấy user");
      }

      // Cập nhật tên
      user.full_name = full_name.trim();
      await user.save();

      logger.info(`User name updated: ${user.email} - New name: ${full_name}`);

      // Trả về thông tin đã cập nhật
      res.status(200).json({
        success: true,
        message: "Cập nhật tên thành công",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          avatar: user.avatar,
          is_active: user.is_active,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, full_name, phone, role } = req.body;

      // Validate input
      if (!username || !email || !password) {
        throw new BadRequestError("Username, email và password là bắt buộc");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError("Email không hợp lệ");
      }

      // Validate role - chỉ cho phép student hoặc teacher
      if (role && !["student", "teacher"].includes(role)) {
        throw new BadRequestError(
          'Role chỉ có thể là "student" hoặc "teacher"'
        );
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new ConflictError("Email đã tồn tại");
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new ConflictError("Username đã tồn tại");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user - chờ duyệt
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || "student", // Mặc định là student nếu không truyền
        full_name,
        phone,
        avatar: "default-avatar.png",
        is_active: false, // Chờ duyệt
      });

      logger.info(
        `User registered as ${user.role} and waiting for approval: ${user.email}`
      );

      res.status(201).json({
        success: true,
        message:
          "Đăng ký thành công! Tài khoản của bạn đang chờ được phê duyệt.",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { action, rejection_reason } = req.body;
      // action: 'approve' | 'reject'

      // Validate action
      if (!["approve", "reject"].includes(action)) {
        throw new BadRequestError('Action phải là "approve" hoặc "reject"');
      }

      // Tìm user
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError("Không tìm thấy user");
      }

      // Check nếu đã được approve rồi
      if (user.is_active && action === "approve") {
        throw new BadRequestError("Tài khoản đã được phê duyệt rồi");
      }

      if (action === "approve") {
        // Phê duyệt
        user.is_active = true;
        await user.save();

        logger.info(`User approved by admin: ${user.email}`);

        res.json({
          success: true,
          message: "Đã phê duyệt tài khoản thành công",
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            phone: user.phone,
            avatar: user.avatar,
            is_active: user.is_active,
            created_at: user.created_at,
          },
        });
      } else {
        // Từ chối - có 2 options:
        // Option 1: Xóa user luôn
        // await User.findByIdAndDelete(userId);

        // Option 2: Giữ user nhưng ghi lý do từ chối
        user.is_active = false;
        await user.save();

        logger.info(
          `User rejected by admin: ${user.email}, reason: ${rejection_reason}`
        );

        res.json({
          success: true,
          message: "Đã từ chối tài khoản",
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async checkRegistrationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.params;

      const user = await User.findOne({ email }).select("-password");
      if (!user) {
        throw new NotFoundError("Không tìm thấy tài khoản với email này");
      }

      let message = "";
      if (user.is_active) {
        message = "Tài khoản đã được phê duyệt";
      } else {
        message = "Tài khoản đang chờ phê duyệt";
      }

      res.json({
        success: true,
        message,
        data: {
          email: user.email,
          username: user.username,
          is_active: user.is_active,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Lấy user có is_active = false VÀ chưa có rejection_reason
      // (vì nếu có rejection_reason = đã bị từ chối rồi)
      const [users, total] = await Promise.all([
        User.find({
          is_active: false,
          rejection_reason: { $exists: false }, // Chưa bị từ chối
        })
          .select("-password")
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(Number(limit)),
        User.countDocuments({
          is_active: false,
          rejection_reason: { $exists: false },
        }),
      ]);

      res.json({
        success: true,
        message: "Lấy danh sách user chờ duyệt thành công",
        data: {
          users: users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            phone: user.phone,
            avatar: user.avatar,
            is_active: user.is_active,
            created_at: user.created_at,
          })),
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
