import express from "express";
import userController from "@/controllers/UserController";
import { createUserValidation } from "../validations/userValidation";
import StudentController from "@/controllers/StudentController";

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create new user (chỉ admin)
 * @access  Private/Admin
 */
router.post(
  "/",
  //   authorize('admin'),
  createUserValidation,
  userController.createUser
);

router.get("/", StudentController.getAllStudents);


router.patch("/:id", userController.updateUserName);

// Tạm thời bỏ auth để test
router.post("/register", userController.register);
router.get('/pending', userController.getPendingUsers); 
router.patch('/:userId/approve', userController.approveUser); 
router.get('/status/:email', userController.checkRegistrationStatus);

export default router;
