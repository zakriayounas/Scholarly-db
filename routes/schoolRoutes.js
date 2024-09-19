import { addNewSchool, getAllSchools, updateSchoolDetails, updateSchoolStatus, viewSchoolDetails } from '../controllers/schoolController.js';
import { customRouter } from '../controllers/sharedController.js';
const schoolRouter = customRouter()

schoolRouter
    .get('/', getAllSchools)  // GET all schools
    .get('/view-school-details/:id', viewSchoolDetails)  // GET details for a specific school
    .post('/add-new-school', addNewSchool)  // POST to add a new school
    .post('/update-school/:id', updateSchoolDetails)  // POST to update a specific school
    .post('/update-school-status', updateSchoolStatus);  // POST to update school status


export default schoolRouter;
