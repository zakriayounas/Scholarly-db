import { getClassSchedules, getStudentSchedules, getTeacherSchedules } from '../controllers/scheduleController.js';
import { customRouter } from '../controllers/sharedController.js';
const scheduleRouter = customRouter()

scheduleRouter
    .get('/class-schedule/:classId', getClassSchedules)  // GET schedules for a specific class
    .get('/student-schedule/:classId', getStudentSchedules)  // GET schedules for students in a specific class
    .post('/teacher-schedule/:teacherId', getTeacherSchedules);  // POST request for teacher schedules

export default scheduleRouter;
