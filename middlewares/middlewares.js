import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
// Middleware to parse JSON data
export const jsonParser = express.json();
// Middleware to parse URL-encoded form data
export const urlEncodedParser = express.urlencoded({ extended: true });
// CORS middleware
export const corsMiddleware = cors();
// Auth middleware

export const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    }
};
