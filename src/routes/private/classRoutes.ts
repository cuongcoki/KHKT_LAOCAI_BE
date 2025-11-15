import express from "express";
import classController from "@/controllers/ClassController";
import { authorize } from "@/middlewares/authorize";
import {
  createClassValidation,
  updateClassValidation,
} from "../validations/classValidation";

const router = express.Router();

/**
 * @route   POST /api/classes
 * @desc    Tạo class mới (teacher/admin)
 * @access  Private/Teacher/Admin
 */
router.post(
  "/",
  authorize("teacher", "admin"),
  createClassValidation,
  classController.createClass
);

/**
 * @route   PUT /api/classes/:classId
 * @desc    Update class
 * @access  Private/Teacher/Admin
 */
router.put(
  "/:classId",
  authorize("teacher", "admin"),
  updateClassValidation,
  classController.updateClass
);

/**
 * @route   GET /api/classes
 * @desc    Get all classes (có filter và pagination)
 * @access  Private
 */
router.get("/", classController.getAllClasses);

/**
 * @route   GET /api/classes/:classId
 * @desc    Get class by ID
 * @access  Private
 */
router.get("/:classId", classController.getClassById);

/**
 * @route   GET /api/classes/teacher/:teacherId
 * @desc    Get classes by teacher
 * @access  Private
 */
router.get("/teacher/:teacherId", classController.getClassesByTeacher);

/**
 * @route   DELETE /api/classes/:classId
 * @desc    Delete class
 * @access  Private/Admin
 */
router.delete("/:classId", authorize("admin"), classController.deleteClass);

export default router;
