import express from 'express';
import cors from 'cors';
// Middleware to parse JSON data
export const jsonParser = express.json();
// Middleware to parse URL-encoded form data
export const urlEncodedParser = express.urlencoded({ extended: true });
// CORS middleware
export const corsMiddleware = cors();
