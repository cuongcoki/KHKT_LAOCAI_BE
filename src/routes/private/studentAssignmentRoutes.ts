import express from "express";
import studentAssignmentController from "@/controllers/StudentAssignmentController";
import {
  createStudentAssignmentValidation,
  submitAssignmentValidation,
  gradeAssignmentValidation,
  updateStudentAssignmentValidation,
  studentAssignmentIdValidation,
  studentIdValidation,
  assignmentIdQueryValidation,
} from "../validations/studentAssignmentValidation";
import { authorize } from "@/middlewares/authorize";

const router = express.Router();

/**
 * @route   POST /api/student-assignments
 * @desc    Tạo student assignment thủ công
 * @access  Private/Teacher/Admin
 */
router.post(
  "/",
  authorize("teacher", "admin"),
  createStudentAssignmentValidation,
  studentAssignmentController.createStudentAssignment
);

/**
 * @route   GET /api/student-assignments
 * @desc    Lấy tất cả student assignments (có pagination)
 * @access  Private/Teacher/Admin
 */
router.get(
  "/",
  authorize("teacher", "admin"),
  studentAssignmentController.getAllStudentAssignments
);

/**
 * @route   GET /api/student-assignments/my-assignments
 * @desc    Lấy assignments của chính mình (student)
 * @access  Private/Student
 */
router.get(
  "/my-assignments",
  authorize("student"),
  studentAssignmentController.getMyAssignments
);

/**
 * @route   GET /api/student-assignments/my-unsubmitted
 * @desc    Lấy bài chưa nộp của chính mình (student)
 * @access  Private/Student
 */
router.get(
  "/my-unsubmitted",
  authorize("student"),
  studentAssignmentController.getMyUnsubmitted
);

/**
 * @route   GET /api/student-assignments/graded-by-me
 * @desc    Lấy bài đã chấm bởi giáo viên (teacher)
 * @access  Private/Teacher
 */
router.get(
  "/graded-by-me",
  authorize("teacher"),
  studentAssignmentController.getGradedByTeacher
);

/**
 * @route   GET /api/student-assignments/submissions
 * @desc    Lấy submissions của một assignment
 * @access  Private/Teacher/Admin
 */
router.get(
  "/submissions",
  authorize("teacher", "admin"),
  assignmentIdQueryValidation,
  studentAssignmentController.getSubmissionsByAssignment
);

/**
 * @route   GET /api/student-assignments/student/:studentId
 * @desc    Lấy assignments của một student
 * @access  Private/Teacher/Admin
 */
router.get(
  "/student/:studentId",
  authorize("teacher", "admin"),
  studentIdValidation,
  studentAssignmentController.getAssignmentsByStudent
);

/**
 * @route   GET /api/student-assignments/student/:studentId/unsubmitted
 * @desc    Lấy bài chưa nộp của student
 * @access  Private/Teacher/Admin
 */
router.get(
  "/student/:studentId/unsubmitted",
  authorize("teacher", "admin"),
  studentIdValidation,
  studentAssignmentController.getUnsubmittedByStudent
);

/**
 * @route   GET /api/student-assignments/:studentAssignmentId
 * @desc    Lấy student assignment theo ID
 * @access  Private/Teacher/Admin/Student
 */
router.get(
  "/:studentAssignmentId",
  authorize("teacher", "admin", "student"),
  studentAssignmentIdValidation,
  studentAssignmentController.getStudentAssignmentById
);

/**
 * @route   POST /api/student-assignments/:studentAssignmentId/submit
 * @desc    Nộp bài (student)
 * @access  Private/Student
 */
router.post(
  "/:studentAssignmentId/submit",
  authorize("student"),
  studentAssignmentIdValidation,
  submitAssignmentValidation,
  studentAssignmentController.submitAssignment
);

/**
 * @route   POST /api/student-assignments/:studentAssignmentId/grade
 * @desc    Chấm điểm (teacher)
 * @access  Private/Teacher/Admin
 */
router.post(
  "/:studentAssignmentId/grade",
  authorize("teacher", "admin"),
  studentAssignmentIdValidation,
  gradeAssignmentValidation,
  studentAssignmentController.gradeAssignment
);

/**
 * @route   PUT /api/student-assignments/:studentAssignmentId
 * @desc    Cập nhật student assignment
 * @access  Private/Teacher/Admin
 */
router.put(
  "/:studentAssignmentId",
  authorize("teacher", "admin"),
  studentAssignmentIdValidation,
  updateStudentAssignmentValidation,
  studentAssignmentController.updateStudentAssignment
);

/**
 * @route   DELETE /api/student-assignments/:studentAssignmentId
 * @desc    Xóa student assignment
 * @access  Private/Teacher/Admin
 */
router.delete(
  "/:studentAssignmentId",
  authorize("teacher", "admin"),
  studentAssignmentIdValidation,
  studentAssignmentController.deleteStudentAssignment
);

export default router;
