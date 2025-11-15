
import express from "express";
import authController from "@/controllers/AuthController";

const router = express.Router();

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  PRIVATE
 */
router.post("/logout",authController.logout);

export default router;