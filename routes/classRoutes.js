import { addNewClass, getSchoolClasses, removeClassAndTransferStudents, updateClassDetails, viewClassDetails } from '../controllers/classController.js';
import { customRouter } from '../controllers/sharedController.js';
import { fetchStudents } from '../controllers/studentController.js';
const classRouter = customRouter()

classRouter
    .get('/', getSchoolClasses)  // GET school Classes
    .get('/:class_id/students', fetchStudents)  // GET specific class students
    .get('/:class_id/view-class-details', viewClassDetails)  // GET details for a specific Class
    .post('/add-new-class', addNewClass)  // POST to add a new Class
    .post('/:class_id/update-class', updateClassDetails)  // POST to update a specific Class
    .post('/remove-class', removeClassAndTransferStudents)  // POST to remove a  Class and transfer its students


export default classRouter;
