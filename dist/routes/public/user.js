"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../../controllers/UserController"));
const userValidation_1 = require("../validations/userValidation");
const StudentController_1 = __importDefault(require("../../controllers/StudentController"));
const router = express_1.default.Router();
router.post('/', userValidation_1.createUserValidation, UserController_1.default.createUser);
router.get("/", StudentController_1.default.getAllStudents);
exports.default = router;
