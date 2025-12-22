"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentController_1 = __importDefault(require("../../controllers/StudentController"));
const UserController_1 = __importDefault(require("../../controllers/UserController"));
const router = express_1.default.Router();
router.get("/students", StudentController_1.default.getAllStudents1);
router.get("/teachers", UserController_1.default.getAllUsersByRoleTeacher);
exports.default = router;
