"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TeacherController_1 = __importDefault(require("../../controllers/TeacherController"));
const authorize_1 = require("../../middlewares/authorize");
const router = express_1.default.Router();
router.get("/profile", (0, authorize_1.authorize)('teacher', 'admin'), TeacherController_1.default.getProfileTeacher);
router.post("/profile/:userIdDiff?", (0, authorize_1.authorize)('teacher', 'admin'), TeacherController_1.default.createProfileTeacher);
router.get("/:teacherId", (0, authorize_1.authorize)("admin"), TeacherController_1.default.getTeacherById);
router.put("/profile/:teacherId", (0, authorize_1.authorize)('teacher', 'admin'), TeacherController_1.default.updateProfileTeacher);
exports.default = router;
