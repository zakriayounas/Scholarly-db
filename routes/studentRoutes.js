import express from 'express';
import { addNewStudent, getAllStudents, updateStudentStatus, updateStudentDetails, viewStudentDetails } from '../controllers/studentController.js';
const studentRouter = express.Router();
studentRouter.get('/', getAllStudents);
studentRouter.post('/add-new-student', addNewStudent);
studentRouter.get('/view-student-details/:student_id', viewStudentDetails);
studentRouter.post('/update-student/:student_id', updateStudentDetails);
studentRouter.post('/update-student-status', updateStudentStatus);

export default studentRouter;
