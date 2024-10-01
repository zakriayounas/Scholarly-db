import multer from "multer";
import path from 'path';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads"); // Save to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const filterFileType = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check the file extension
    const mimetype = filetypes.test(file.mimetype); // Check the MIME type

    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    cb(new Error('Error: File upload only supports the following filetypes: jpeg, jpg, png, gif')); // Reject the file and return an error
};

export const uploadFile = multer({
    storage: fileStorage,
    limits: { fileSize: 1000000 }, //  size limit to 1MB
    fileFilter: filterFileType,
});

