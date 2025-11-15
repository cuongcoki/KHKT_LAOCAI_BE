
import express from "express";
import teacherController from "@/controllers/TeacherController";
import { authorize } from "@/middlewares/authorize";

const router = express.Router();

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  PRIVATE
 */
router.get("/profile",authorize('teacher','admin'),teacherController.getProfileTeacher);
router.post("/profile/:userIdDiff?",authorize('teacher','admin'),teacherController.createProfileTeacher);
router.get("/:teacherId",authorize("admin"), teacherController.getTeacherById);
router.put("/profile/:teacherId",authorize('teacher','admin'),teacherController.updateProfileTeacher);


export default router;