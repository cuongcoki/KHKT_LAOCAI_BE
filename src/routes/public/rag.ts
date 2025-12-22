import express from "express";
import StudentController from "@/controllers/StudentController";
import UserController from "@/controllers/UserController";

const router = express.Router();

router.get("/students", StudentController.getAllStudents1);
router.get("/teachers", UserController.getAllUsersByRoleTeacher);
export default router;
