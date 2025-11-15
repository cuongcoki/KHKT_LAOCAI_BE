import express from 'express';
import userController from '@/controllers/UserController';
import { createUserValidation } from '../validations/userValidation';
import { authorize } from '@/middlewares/authorize';
import StudentController from '@/controllers/StudentController';

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create new user (chỉ admin)
 * @access  Private/Admin
 */
router.post(
  '/',
//   authorize('admin'),
  createUserValidation,
  userController.createUser
);


router.get(
  "/",
  StudentController.getAllStudents
);

export default router;