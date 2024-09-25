import { uploadFile } from '../controllers/fileController.js';
import { customRouter } from '../controllers/sharedController.js';
import { addNewStudent, getAllStudents, updateStudentDetails, updateStudentStatus, viewStudentDetails } from '../controllers/studentController.js';
import { fileUploadMiddleware } from '../middlewares/middlewares.js';
const studentRouter = customRouter()

studentRouter
    .get('/', getAllStudents)  // GET all students
    .get('/view-student-details/:student_id', viewStudentDetails)  // GET details for a specific student
    .post('/add-new-student', fileUploadMiddleware, addNewStudent)  // POST to add a new student
    .post('/update-student/:student_id', fileUploadMiddleware, updateStudentDetails)  // POST to update a specific student
    .post('/update-student-status', updateStudentStatus);  // POST to update student status


export default studentRouter;
