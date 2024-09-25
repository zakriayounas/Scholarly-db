import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import { uploadFile } from '../controllers/fileController.js';
import multer from 'multer';
import mongoose from 'mongoose';
import School from '../models/schoolModel.js';
import User from '../models/userModel.js';

dotenv.config();
// Middleware to parse JSON data
export const jsonParser = express.json();
// Middleware to parse URL-encoded form data
export const urlEncodedParser = express.urlencoded({ extended: true });
// CORS middleware
export const corsMiddleware = cors();
// Auth middleware

export const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user information to req object for further use in route handlers
        req.user = {
            id: user._id,
            email: user.email,
            // role: user.role,  // Add any other fields you may need
        };

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token or user' });
    }
};

//file upload middleware
export const fileUploadMiddleware = (req, res, next) => {
    uploadFile.single('profile_image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle multer-specific errors (e.g., file too large)
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // Handle any other errors (e.g., invalid file type)
            return res.status(400).json({ message: err.message });
        }
        // If no error, continue to the next middleware
        next();
    });
};
export const validateSchoolAndAdmin = async (req, res, next) => {
    const { school_id: schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }

    try {
        // Check if the school exists and if the requesting user is the admin
        const school = await School.findById(schoolId).populate('school_admin');

        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }
        if (school.school_admin._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "This is not your school" });
        }
        req.school = school;  // Attach the school to the request object
        next();  // Move on to the next middleware or route handler
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while validating school" });
    }
};