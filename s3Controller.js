import multer from "multer";
import path from 'path';
import multerS3 from "multer-s3"
import AWS from "aws-sdk"
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const fileStorage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME, // Your S3 bucket name
    acl: 'public-read', // Set permissions (can be 'private', 'public-read', etc.)
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the content type
    key: (req, file, cb) => {
        cb(null, `uploads/${Date.now()}-${file.originalname}`); // Define the path in the S3 bucket
    }
})
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


