import dotenv from 'dotenv';
import express from 'express';
import connectDB from './database/connect.js';
import { corsMiddleware, isAuthenticated, jsonParser, urlEncodedParser, validateSchoolAndAdmin } from './middlewares/middlewares.js';
import eventRouter from './routes/eventRoutes.js';
import schoolRouter from './routes/schoolRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import teacherRouter from './routes/teacherRoutes.js';
import userRouter from "./routes/userRoutes.js";
import draftRouter from './routes/draftRoutes.js';
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON data
app.use(jsonParser);

// Serving upload folder for image view
app.use('/uploads', express.static('uploads'));

// Middleware to parse URL-encoded form data
app.use(urlEncodedParser);

// Use CORS middleware
app.use(corsMiddleware);

// Global authentication middleware for school-related routes
app.use('/api/schools/', isAuthenticated);

// Use routes
app.use('/api/user', userRouter);
app.use('/api/schools', schoolRouter);
app.use('/api/schools/:school_id/teachers', validateSchoolAndAdmin, teacherRouter);
app.use('/api/schools/:school_id/students', validateSchoolAndAdmin, studentRouter);
app.use('/api/schools/:school_id/events', validateSchoolAndAdmin, eventRouter);
app.use('/api/schools/:school_id/drafts', validateSchoolAndAdmin, draftRouter);

// Home route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
