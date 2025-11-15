"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEnvVar = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
exports.default = getEnvVar;
