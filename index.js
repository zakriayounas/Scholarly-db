import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/connect.js';
import userRouter from "./routes/userRoutes.js"
import teacherRouter from './routes/teacherRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import cors from "cors"
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Use CORS middleware
app.use(cors());
// Use routes
app.use('/api/user', userRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/students', studentRouter);
// Home route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
