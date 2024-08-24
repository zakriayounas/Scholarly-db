import express from 'express';
import { addNewTeacher, getAllTeachers, removeTeacher, updateTeacher, viewTeacherDetails } from '../controllers/teacherController.js';
const teacherRouter = express.Router();
teacherRouter.get('/', getAllTeachers);
teacherRouter.post('/add-new-teacher', addNewTeacher);
teacherRouter.get('/view-teacher-details/:id', viewTeacherDetails);
teacherRouter.post('/update-teacher/:id', updateTeacher);
teacherRouter.delete('/delete-teacher/:id', removeTeacher);

export default teacherRouter;
