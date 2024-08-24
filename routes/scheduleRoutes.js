import express from 'express';
import { getClassSchedules, getStudentSchedules, getTeacherSchedules } from '../controllers/scheduleController.js';
const scheduleRouter = express.Router();
scheduleRouter.get('/class-schedule/:classId', getClassSchedules);
scheduleRouter.get('/student-schedule/:classId', getStudentSchedules);
scheduleRouter.post('/teacher-schedule/:teacherId', getTeacherSchedules);

export default scheduleRouter;
