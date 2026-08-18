import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../public/img/portfolio');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init Upload
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// For CV upload (PDF only)
const cvUploadDir = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(__dirname, '../public/uploads');

const cvStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(cvUploadDir)) {
            fs.mkdirSync(cvUploadDir, { recursive: true });
        }
        cb(null, cvUploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'cv.pdf'); // Always overwrite the old cv.pdf
    }
});

function checkCVType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('PDF Only!'));
    }
}

export const uploadCV = multer({
    storage: cvStorage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkCVType(file, cb);
    }
});
