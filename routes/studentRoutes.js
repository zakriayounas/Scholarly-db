import express from 'express';
import { addNewStudent, getAllStudents, updateStudentStatus, updateStudent, viewStudentDetails } from '../controllers/studentController.js';
import { isAuthenticated } from '../middlewares/middlewares.js';
const studentRouter = express.Router();
// studentRouter.use('/', isAuthenticated);
studentRouter.get('/', getAllStudents);
studentRouter.post('/add-new-student', addNewStudent);
studentRouter.get('/view-student-details/:id', viewStudentDetails);
studentRouter.post('/update-student/:id', updateStudent);
studentRouter.post('/update-student-status', updateStudentStatus);

export default studentRouter;
