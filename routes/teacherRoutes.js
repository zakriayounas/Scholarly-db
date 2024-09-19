import express from 'express';
import { addNewTeacher, getAllTeachers, updateTeacherStatus, updateTeacherDetails, viewTeacherDetails } from '../controllers/teacherController.js';
const teacherRouter = express.Router();
teacherRouter.get('/', getAllTeachers);
teacherRouter.post('/add-new-teacher', addNewTeacher);
teacherRouter.get('/view-teacher-details/:teacher_id', viewTeacherDetails);
teacherRouter.post('/update-teacher/:teacher_id', updateTeacherDetails);
teacherRouter.post('/update-teacher-status', updateTeacherStatus);

export default teacherRouter;
