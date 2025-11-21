"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentController_1 = __importDefault(require("../../controllers/StudentController"));
const studentValidation_1 = require("../validations/studentValidation");
const authorize_1 = require("../../middlewares/authorize");
const router = express_1.default.Router();
router.post("/profile/:userIdDiff?", (0, authorize_1.authorize)("admin", "teacher", "student"), studentValidation_1.createStudentValidation, StudentController_1.default.createProfileStudent);
router.put("/profile", (0, authorize_1.authorize)("student"), studentValidation_1.updateStudentValidation, StudentController_1.default.updateProfileStudent);
router.get("/profile", (0, authorize_1.authorize)("student"), StudentController_1.default.getProfileStudent);
router.get("/", (0, authorize_1.authorize)("teacher", "admin"), StudentController_1.default.getAllStudents);
router.get("/search", (0, authorize_1.authorize)("teacher", "admin"), StudentController_1.default.searchByClass);
router.get("/:studentId", (0, authorize_1.authorize)("teacher", "admin"), StudentController_1.default.getStudentById);
router.delete("/profile", (0, authorize_1.authorize)("student", "admin"), StudentController_1.default.deleteProfile);
exports.default = router;
