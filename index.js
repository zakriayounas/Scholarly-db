import dotenv from 'dotenv';
import express from 'express';
import connectDB from './database/connect.js';
import { corsMiddleware, isAuthenticated, jsonParser, urlEncodedParser } from './middlewares/middlewares.js';
import eventRouter from './routes/eventRoutes.js';
import schoolRouter from './routes/schoolRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import teacherRouter from './routes/teacherRoutes.js';
import userRouter from "./routes/userRoutes.js";
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON data
app.use(jsonParser);

// Middleware to parse URL-encoded form data
app.use(urlEncodedParser);

// Use CORS middleware
app.use(corsMiddleware);
// Middleware for user admin 
app.use('/api/schools/', isAuthenticated);
// Use routes
app.use('/api/user', userRouter);
app.use('/api/schools', schoolRouter);
app.use('/api/schools/:school_id/teachers', teacherRouter);
app.use('/api/schools/:school_id/students', studentRouter);
app.use('/api/schools/:school_id/events', eventRouter);
// app.use('/api/schools/schedules', scheduleRouter);
// Home route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
