"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClassController_1 = __importDefault(require("../../controllers/ClassController"));
const authorize_1 = require("../../middlewares/authorize");
const classValidation_1 = require("../validations/classValidation");
const router = express_1.default.Router();
router.post("/", (0, authorize_1.authorize)("teacher", "admin"), classValidation_1.createClassValidation, ClassController_1.default.createClass);
router.put("/:classId", (0, authorize_1.authorize)("teacher", "admin"), classValidation_1.updateClassValidation, ClassController_1.default.updateClass);
router.get("/", ClassController_1.default.getAllClasses);
router.get("/:classId", ClassController_1.default.getClassById);
router.get("/teacher/:teacherId", ClassController_1.default.getClassesByTeacher);
router.delete("/:classId", (0, authorize_1.authorize)("admin"), ClassController_1.default.deleteClass);
exports.default = router;
