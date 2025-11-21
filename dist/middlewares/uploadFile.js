"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativePath = exports.deleteFile = exports.getFileType = exports.uploadFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const baseUploadDir = path_1.default.join(__dirname, '../upload');
const folders = {
    pdf: path_1.default.join(baseUploadDir, 'pdf'),
    word: path_1.default.join(baseUploadDir, 'word'),
    zip: path_1.default.join(baseUploadDir, 'zip'),
    image: path_1.default.join(baseUploadDir, 'image'),
    video: path_1.default.join(baseUploadDir, 'video'),
};
Object.values(folders).forEach((folder) => {
    if (!fs_1.default.existsSync(folder)) {
        fs_1.default.mkdirSync(folder, { recursive: true });
    }
});
const getFileType = (mimetype) => {
    if (mimetype === 'application/pdf') {
        return 'pdf';
    }
    if (mimetype === 'application/msword' ||
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'word';
    }
    if (mimetype === 'application/zip' ||
        mimetype === 'application/x-zip-compressed' ||
        mimetype === 'application/x-rar-compressed' ||
        mimetype === 'application/x-7z-compressed') {
        return 'zip';
    }
    if (mimetype.startsWith('image/')) {
        return 'image';
    }
    if (mimetype.startsWith('video/')) {
        return 'video';
    }
    return 'other';
};
exports.getFileType = getFileType;
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const fileType = getFileType(file.mimetype);
        const destFolder = folders[fileType] || baseUploadDir;
        cb(null, destFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const nameWithoutExt = path_1.default.basename(file.originalname, ext);
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${safeName}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận: PDF, Word, ZIP/RAR/7z, Images (JPG/PNG/GIF/WebP), Videos (MP4/MPEG/AVI/WebM)'));
    }
};
exports.uploadFile = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});
const deleteFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
exports.deleteFile = deleteFile;
const getRelativePath = (absolutePath) => {
    return absolutePath.replace(baseUploadDir, '').replace(/\\/g, '/');
};
exports.getRelativePath = getRelativePath;
