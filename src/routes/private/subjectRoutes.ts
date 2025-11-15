import express from 'express';
import subjectController from '@/controllers/subjectController';
import { authorize } from "@/middlewares/authorize";
import {
  createSubjectValidation,
  updateSubjectValidation,
} from '../validations/subjectValidation';

const router = express.Router();

/**
 * @route   POST /api/subjects
 * @desc    Tạo subject mới (admin/teacher)
 * @access  Private/Teacher/Admin
 */
router.post(
  '/',
  authorize('teacher', 'admin'),
  createSubjectValidation,
  subjectController.createSubject    
);

/**
 * @route   PUT /api/subjects/:subjectId
 * @desc    Update subject
 * @access  Private/Teacher/Admin
 */
router.put(
  '/:subjectId',
  authorize('teacher', 'admin'),
  updateSubjectValidation,
  subjectController.updateSubject
);

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects (có filter và pagination)
 * @access  Public
 */
router.get('/', subjectController.getAllSubjects);

/**
 * @route   GET /api/subjects/grade
 * @desc    Get subjects by grade level
 * @access  Public
 */
router.get('/grade/search', subjectController.getSubjectsByGradeLevel);

/**
 * @route   GET /api/subjects/:subjectId
 * @desc    Get subject by ID
 * @access  Public
 */
router.get('/:subjectId', subjectController.getSubjectById);

/**
 * @route   DELETE /api/subjects/:subjectId
 * @desc    Delete subject
 * @access  Private/Admin
 */
router.delete(
  '/:subjectId',
  authorize('admin'),
  subjectController.deleteSubject
);

export default router;