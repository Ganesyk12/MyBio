import multer from 'multer';
import path from 'path';

// Use memory storage for direct upload to R2 / buffer handling
const memoryStorage = multer.memoryStorage();

// Check File Type for images
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only! (Allowed: jpeg, jpg, png, gif, webp)'));
    }
}

// Check File Type for CV (PDF only)
function checkCVType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: PDF Only!'));
    }
}

// Portfolio Images Upload (5MB Limit)
export const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// CV Upload (10MB Limit)
export const uploadCV = multer({
    storage: memoryStorage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkCVType(file, cb);
    }
});

