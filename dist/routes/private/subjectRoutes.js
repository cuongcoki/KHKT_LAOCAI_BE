"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subjectController_1 = __importDefault(require("../../controllers/subjectController"));
const authorize_1 = require("../../middlewares/authorize");
const subjectValidation_1 = require("../validations/subjectValidation");
const router = express_1.default.Router();
router.post('/', (0, authorize_1.authorize)('teacher', 'admin'), subjectValidation_1.createSubjectValidation, subjectController_1.default.createSubject);
router.put('/:subjectId', (0, authorize_1.authorize)('teacher', 'admin'), subjectValidation_1.updateSubjectValidation, subjectController_1.default.updateSubject);
router.get('/', subjectController_1.default.getAllSubjects);
router.get('/grade/search', subjectController_1.default.getSubjectsByGradeLevel);
router.get('/:subjectId', subjectController_1.default.getSubjectById);
router.delete('/:subjectId', (0, authorize_1.authorize)('admin'), subjectController_1.default.deleteSubject);
exports.default = router;
