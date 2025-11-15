"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = __importDefault(require("../../controllers/AuthController"));
const authValidation_1 = require("../validations/authValidation");
const router = express_1.default.Router();
router.post("/login", authValidation_1.loginValidation, AuthController_1.default.login);
router.post("/refresh", AuthController_1.default.refreshAccessToken);
exports.default = router;
