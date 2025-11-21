"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const rag_1 = __importDefault(require("./rag"));
const publicRouter = (0, express_1.Router)();
publicRouter.use('/auth', auth_1.default);
publicRouter.use('/users', user_1.default);
publicRouter.use('/rag', rag_1.default);
exports.default = publicRouter;
