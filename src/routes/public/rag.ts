import express from "express";
import StudentController from "@/controllers/StudentController";

const router = express.Router();

router.get("/students", StudentController.getAllStudents1);
export default router;
