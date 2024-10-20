import { customRouter } from '../controllers/sharedController.js';
import { addNewTeacher, getSchoolTeachers, updateTeacherDetails, updateTeacherStatus, viewTeacherDetails } from '../controllers/teacherController.js';
import { fileUploadMiddleware } from '../middlewares/middlewares.js';
const teacherRouter = customRouter()

teacherRouter
    .get('/', getSchoolTeachers)  // GET school teachers
    .get('/:teacher_id/view-teacher-details', viewTeacherDetails)  // GET details for a specific teacher
    .post('/add-new-teacher', fileUploadMiddleware, addNewTeacher)  // POST to add a new teacher
    .post('/:teacher_id/update-teacher', fileUploadMiddleware, updateTeacherDetails)  // POST to update a specific teacher
    .post('/:teacher_id/update-teacher-status', updateTeacherStatus);  // POST to update teacher status


export default teacherRouter;
