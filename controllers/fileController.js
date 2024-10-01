import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path'; // Assuming you're still using path for file type filtering

// Load environment variables from .env file
dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Cloudinary storage without forcing 'jpg' format
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Specify a folder in Cloudinary
        public_id: (req, file) => {
            // Remove the file extension from the original name
            const fileNameWithoutExt = path.parse(file.originalname).name;
            return `${Date.now()}-${fileNameWithoutExt}`; // Create the public ID without the extension
        },
        format: async (req, file) => path.extname(file.originalname).slice(1), // Keep the original format
    },
});

// File type filter to allow only images
const filterFileType = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    cb(new Error('Error: Only images are allowed (jpeg, jpg, png, gif)')); // Reject invalid file types
};

// Set up multer with Cloudinary storage and file filters
export const uploadFile = multer({
    storage: storage, // Use Cloudinary storage instead of diskStorage
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: filterFileType,
});
