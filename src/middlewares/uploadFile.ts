import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Base upload directory
const baseUploadDir = path.join(__dirname, '../upload');

// Tạo các folder cho từng loại file
const folders = {
  pdf: path.join(baseUploadDir, 'pdf'),
  word: path.join(baseUploadDir, 'word'),
  zip: path.join(baseUploadDir, 'zip'),
  image: path.join(baseUploadDir, 'image'),
  video: path.join(baseUploadDir, 'video'),
};

// Tạo tất cả các folder nếu chưa tồn tại
Object.values(folders).forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// Map mimetype to file type
const getFileType = (mimetype: string): string => {
  // PDF
  if (mimetype === 'application/pdf') {
    return 'pdf';
  }

  // Word documents
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'word';
  }

  // ZIP/Archive
  if (
    mimetype === 'application/zip' ||
    mimetype === 'application/x-zip-compressed' ||
    mimetype === 'application/x-rar-compressed' ||
    mimetype === 'application/x-7z-compressed'
  ) {
    return 'zip';
  }

  // Images
  if (mimetype.startsWith('image/')) {
    return 'image';
  }

  // Videos
  if (mimetype.startsWith('video/')) {
    return 'video';
  }

  return 'other';
};

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = getFileType(file.mimetype);
    const destFolder = folders[fileType as keyof typeof folders] || baseUploadDir;
    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // Sanitize filename
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// Cấu hình file filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // PDF
    'application/pdf',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // ZIP/Archive
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận: PDF, Word, ZIP/RAR/7z, Images (JPG/PNG/GIF/WebP), Videos (MP4/MPEG/AVI/WebM)'));
  }
};

// Export multer middleware
export const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Helper function để lấy file type
export { getFileType };

// Helper function để xóa file
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function để lấy đường dẫn tương đối từ upload folder
export const getRelativePath = (absolutePath: string): string => {
  return absolutePath.replace(baseUploadDir, '').replace(/\\/g, '/');
};
