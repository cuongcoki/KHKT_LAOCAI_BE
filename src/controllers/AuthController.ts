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

class AuthController {
  /**
   * Login - Đăng nhập
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new BadRequestError('Email và password là bắt buộc');
      }

      // Find user by email (include password)
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new UnauthorizedError('Email hoặc password không đúng');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedError('Tài khoản đã bị khóa');
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Email hoặc password không đúng');
      }

      // Generate tokens
      const { accessToken, refreshToken } = await jwtService.generateTokens(
        user.id,
        user.role
      );

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`User logged in: ${user.email}`);

      // Send response
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            avatar: user.avatar,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Access Token - Làm mới access token
   */
  async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Get refresh token from cookie
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token không tồn tại');
      }

      // Generate new access token
      const newAccessToken = await jwtService.refreshAccessToken(refreshToken);

      logger.info('Access token refreshed');

      // Send response
      res.json({
        success: true,
        message: 'Làm mới token thành công',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout - Đăng xuất
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      logger.info('User logged out');

      res.json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();