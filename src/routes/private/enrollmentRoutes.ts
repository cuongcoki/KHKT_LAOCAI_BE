import express from 'express';
import enrollmentController from '@/controllers/enrollmentController';
import { authorize } from "@/middlewares/authorize";
import {
  createEnrollmentValidation,
  updateEnrollmentValidation,
  updateGradeValidation,
} from '@/routes/validations/enrollmentValidation';

const router = express.Router();

/**
 * @route   POST /api/enrollments
 * @desc    Tạo enrollment mới (student đăng ký lớp)
 * @access  Private/Student/Teacher/Admin
 */
router.post(
  '/',
  authorize('student', 'teacher', 'admin'),
  createEnrollmentValidation,
  enrollmentController.createEnrollment
);

/**
 * @route   PUT /api/enrollments/:enrollmentId
 * @desc    Update enrollment
 * @access  Private/Teacher/Admin
 */
router.put(
  '/:enrollmentId',
  authorize('teacher', 'admin'),
  updateEnrollmentValidation,
  enrollmentController.updateEnrollment
);

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (có filter và pagination)
 * @access  Private/Teacher/Admin
 */
router.get('/',  authorize('teacher', 'admin'), enrollmentController.getAllEnrollments);

/**
 * @route   GET /api/enrollments/:enrollmentId
 * @desc    Get enrollment by ID
 * @access  Private
 */
router.get('/:enrollmentId',  enrollmentController.getEnrollmentById);

/**
 * @route   GET /api/enrollments/student/:studentId
 * @desc    Get enrollments by student
 * @access  Private
 */
router.get('/student/:studentId', enrollmentController.getEnrollmentsByStudent);

/**
 * @route   GET /api/enrollments/class/:classId
 * @desc    Get enrollments by class
 * @access  Private/Teacher/Admin
 */
router.get(
  '/class/:classId',
  authorize('teacher', 'admin'),
  enrollmentController.getEnrollmentsByClass
);

/**
 * @route   POST /api/enrollments/:enrollmentId/drop
 * @desc    Drop enrollment (rời khỏi lớp)
 * @access  Private/Student/Teacher/Admin
 */
router.post(
  '/:enrollmentId/drop',
  authorize('student', 'teacher', 'admin'),
  enrollmentController.dropEnrollment
);

/**
 * @route   POST /api/enrollments/:enrollmentId/complete
 * @desc    Complete enrollment
 * @access  Private/Teacher/Admin
 */
router.post(
  '/:enrollmentId/complete',
  authorize('teacher', 'admin'),
  enrollmentController.completeEnrollment
);

/**
 * @route   PUT /api/enrollments/:enrollmentId/grade
 * @desc    Update grade
 * @access  Private/Teacher/Admin
 */
router.put(
  '/:enrollmentId/grade',
  authorize('teacher', 'admin'),
  updateGradeValidation,
  enrollmentController.updateGrade
);

/**
 * @route   DELETE /api/enrollments/:enrollmentId
 * @desc    Delete enrollment
 * @access  Private/Admin
 */
router.delete(
  '/:enrollmentId',
  authorize('admin'),
  enrollmentController.deleteEnrollment
);

export default router;