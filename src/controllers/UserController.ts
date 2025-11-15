/**
 * Custom modules
 */
import { jwtService } from '@/helpers/jwt';
import { logger } from '../helpers/winston';
import config from '../config';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../utils/errorHandle';

/**
 * Models
 */
import { User } from '../models/User';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

class UserController {
  /**
   * Create User - Tạo user mới
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role, full_name, phone } = req.body;

      // Validate input
      if (!username || !email || !password) {
        throw new BadRequestError('Username, email và password là bắt buộc');
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new ConflictError('Email đã tồn tại');
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        throw new ConflictError('Username đã tồn tại');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'student',
        full_name,
        phone,
      });

      logger.info(`User created: ${user.email}`);

      // Return user info (không trả password)
      res.status(201).json({
        success: true,
        message: 'Tạo user thành công',
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
}

export default new UserController();