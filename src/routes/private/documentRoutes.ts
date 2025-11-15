import express from 'express';
import documentController from '@/controllers/documentController';
import { authorize } from "@/middlewares/authorize";
import { uploadDocument } from '@/middlewares/upload';
import {
  createDocumentValidation,
  updateDocumentValidation,
} from '../validations/documentValidation';

const router = express.Router();

/**
 * @route   POST /api/documents
 * @desc    Tạo document mới
 * @access  Private/Teacher/Admin
 */
router.post(
  '/',
  authorize('teacher', 'admin'),
  uploadDocument.single('file'),
  createDocumentValidation,
  documentController.createDocument
);

/**
 * @route   PUT /api/documents/:documentId
 * @desc    Update document
 * @access  Private/Teacher/Admin
 */
router.put(
  '/:documentId',
  authorize('teacher', 'admin'),
  updateDocumentValidation,
  documentController.updateDocument
);

/**
 * @route   GET /api/documents
 * @desc    Get all documents (có filter và pagination)
 * @access  Public
 */
router.get('/', documentController.getAllDocuments);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get document by ID
 * @access  Public
 */
router.get('/:documentId', documentController.getDocumentById);

/**
 * @route   GET /api/documents/subject/:subjectId
 * @desc    Get documents by subject
 * @access  Public
 */
router.get('/subject/:subjectId', documentController.getDocumentsBySubject);

/**
 * @route   GET /api/documents/teacher/:teacherId
 * @desc    Get documents by teacher
 * @access  Public
 */
router.get('/teacher/:teacherId', documentController.getDocumentsByTeacher);

/**
 * @route   POST /api/documents/:documentId/download
 * @desc    Download document (increment count)
 * @access  Private
 */
router.post('/:documentId/download',documentController.downloadDocument);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete document
 * @access  Private/Teacher/Admin
 */
router.delete(
  '/:documentId',
  authorize('teacher', 'admin'),
  documentController.deleteDocument
);

export default router;