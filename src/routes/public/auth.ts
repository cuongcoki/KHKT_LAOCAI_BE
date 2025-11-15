import express from "express";
import authController from "@/controllers/AuthController";
import { loginValidation } from "../validations/authValidation";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginValidation, authController.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  PRIVATE
 */
router.post("/refresh", authController.refreshAccessToken);

export default router;
