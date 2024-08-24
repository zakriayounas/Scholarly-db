import express from 'express';
import { addNewStudent, getAllStudents, removeStudent, updateStudent, viewStudentDetails } from '../controllers/studentController.js';
const studentRouter = express.Router();
studentRouter.get('/', getAllStudents);
studentRouter.post('/add-new-student', addNewStudent);
studentRouter.get('/view-student-details/:id', viewStudentDetails);
studentRouter.post('/update-student/:id', updateStudent);
studentRouter.delete('/delete-student/:id', removeStudent);

export default studentRouter;
