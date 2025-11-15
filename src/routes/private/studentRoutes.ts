import express from "express";
import studentController from "@/controllers/StudentController";
import {
  createStudentValidation,
  updateStudentValidation,
} from "../validations/studentValidation";
import { authorize } from "@/middlewares/authorize";
const router = express.Router();

/**
 * @route   POST /api/students/profile
 * @desc    Tạo profile học sinh (student tự tạo)
 * @access  Private/Student
 */
router.post(
  "/profile/:userIdDiff?",
  authorize("admin", "teacher", "student"),
  createStudentValidation,
  studentController.createProfileStudent
);

/**
 * @route   PUT /api/students/profile
 * @desc    Update profile học sinh (student tự update)
 * @access  Private/Student
 */
router.put(
  "/profile",
  authorize("student"),
  updateStudentValidation,
  studentController.updateProfileStudent
);

/**
 * @route   GET /api/students/profile
 * @desc    Lấy profile của chính mình
 * @access  Private/Student
 */
router.get(
  "/profile",
  authorize("student"),
  studentController.getProfileStudent
);

/**
 * @route   GET /api/students
 * @desc    Lấy tất cả students (có pagination)
 * @access  Private/Teacher/Admin
 */
router.get(
  "/",
  authorize("teacher", "admin"),
  studentController.getAllStudents
);

/**
 * @route   GET /api/students/search
 * @desc    Tìm kiếm student theo lớp
 * @access  Private/Teacher/Admin
 */
router.get(
  "/search",
  authorize("teacher", "admin"),
  studentController.searchByClass
);

/**
 * @route   GET /api/students/:studentId
 * @desc    Lấy profile student theo ID
 * @access  Private/Teacher/Admin
 */
router.get(
  "/:studentId",
  authorize("teacher", "admin"),
  studentController.getStudentById
);

/**
 * @route   DELETE /api/students/profile
 * @desc    Xóa profile học sinh
 * @access  Private/Student/Admin
 */
router.delete(
  "/profile",
  authorize("student", "admin"),
  studentController.deleteProfile
);

export default router;