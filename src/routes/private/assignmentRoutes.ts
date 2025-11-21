import express from "express";
import assignmentController from "@/controllers/AssignmentController";
import {
  createAssignmentValidation,
  updateAssignmentValidation,
  assignmentIdValidation,
  classIdQueryValidation,
  subjectIdQueryValidation,
} from "../validations/assignmentValidation";
import { authorize } from "@/middlewares/authorize";
import { uploadFile } from "@/middlewares/uploadFile";

const router = express.Router();

/**
 * @route   POST /api/assignments
 * @desc    Tạo assignment mới với upload files
 * @access  Private/Teacher/Admin
 */
router.post(
  "/",
  authorize("teacher", "admin"),
  uploadFile.array("attachments", 10), // Cho phép upload tối đa 10 files
  createAssignmentValidation,
  assignmentController.createAssignment
);

/**
 * @route   GET /api/assignments
 * @desc    Lấy tất cả assignments (có pagination)
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/",
  authorize("teacher", "admin", "student"),
  assignmentController.getAllAssignments
);

/**
 * @route   GET /api/assignments/class
 * @desc    Lấy assignments theo class
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/class",
  authorize("teacher", "admin", "student"),
  classIdQueryValidation,
  assignmentController.getAssignmentsByClass
);

/**
 * @route   GET /api/assignments/subject
 * @desc    Lấy assignments theo subject
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/subject",
  authorize("teacher", "admin", "student"),
  subjectIdQueryValidation,
  assignmentController.getAssignmentsBySubject
);

/**
 * @route   GET /api/assignments/upcoming
 * @desc    Lấy assignments sắp đến hạn
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/upcoming",
  authorize("teacher", "admin", "student"),
  classIdQueryValidation,
  assignmentController.getUpcomingAssignments
);

/**
 * @route   GET /api/assignments/past-due
 * @desc    Lấy assignments quá hạn
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/past-due",
  authorize("teacher", "admin", "student"),
  classIdQueryValidation,
  assignmentController.getPastDueAssignments
);

/**
 * @route   GET /api/assignments/:assignmentId
 * @desc    Lấy assignment theo ID
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/:assignmentId",
  authorize("teacher", "admin", "student"),
  assignmentIdValidation,
  assignmentController.getAssignmentById
);

/**
 * @route   GET /api/assignments/:assignmentId/statistics
 * @desc    Lấy thống kê assignment
 * @access  Private/Teacher/Admin
 */
router.get(
  "/:assignmentId/statistics",
  authorize("teacher", "admin"),
  assignmentIdValidation,
  assignmentController.getAssignmentStatistics
);

/**
 * @route   PUT /api/assignments/:assignmentId
 * @desc    Cập nhật assignment
 * @access  Private/Teacher/Admin
 */
router.put(
  "/:assignmentId",
  authorize("teacher", "admin"),
  assignmentIdValidation,
  updateAssignmentValidation,
  assignmentController.updateAssignment
);

/**
 * @route   DELETE /api/assignments/:assignmentId
 * @desc    Xóa assignment
 * @access  Private/Teacher/Admin
 */
router.delete(
  "/:assignmentId",
  authorize("teacher", "admin"),
  assignmentIdValidation,
  assignmentController.deleteAssignment
);

export default router;
