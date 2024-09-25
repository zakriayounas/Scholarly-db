import { customRouter } from '../controllers/sharedController.js';
import { addNewTeacher, getAllTeachers, updateTeacherDetails, updateTeacherStatus, viewTeacherDetails } from '../controllers/teacherController.js';
import { fileUploadMiddleware } from '../middlewares/middlewares.js';
const teacherRouter = customRouter()

teacherRouter
    .get('/', getAllTeachers)  // GET all teachers
    .get('/view-teacher-details/:teacher_id', viewTeacherDetails)  // GET details for a specific teacher
    .post('/add-new-teacher', fileUploadMiddleware, addNewTeacher)  // POST to add a new teacher
    .post('/update-teacher/:teacher_id', fileUploadMiddleware, updateTeacherDetails)  // POST to update a specific teacher
    .post('/update-teacher-status', updateTeacherStatus);  // POST to update teacher status


export default teacherRouter;
