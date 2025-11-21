/**
 * Node modules
 */

import { Router } from "express";

/**
 * Routes
 */
import authRouter from "./authRoutes";
import teacherRouter from "./teacherRoutes";
import studentRoutes from "./studentRoutes";
import classRoutes from "./classRoutes";
import subjectRoutes from "./subjectRoutes";
import documentRoutes from "./documentRoutes";
import enrollmentRoutes from "./enrollmentRoutes";
import notificationRoutes from "./notificationRoutes";
import assignmentRoutes from "./assignmentRoutes";
import studentAssignmentRoutes from "./studentAssignmentRoutes";

const privateRouter = Router();

privateRouter.use("/auth", authRouter);
privateRouter.use("/teachers", teacherRouter);
privateRouter.use("/students", studentRoutes);
privateRouter.use("/classes", classRoutes);
privateRouter.use("/subjects", subjectRoutes);
privateRouter.use("/documents", documentRoutes);
privateRouter.use("/enrollments", enrollmentRoutes);
privateRouter.use("/notifications", notificationRoutes);
privateRouter.use("/assignments", assignmentRoutes);
privateRouter.use("/student-assignments", studentAssignmentRoutes);

export default privateRouter;
