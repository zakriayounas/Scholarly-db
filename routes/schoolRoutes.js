import { addNewSchool, getAllSchools, updateSchoolDetails, updateSchoolStatus, viewSchoolDetails } from '../controllers/schoolController.js';
import { customRouter } from '../controllers/sharedController.js';
const schoolRouter = customRouter()

schoolRouter
    .get('/', getAllSchools)  // GET all schools
    .get('/:id/view-school-details', viewSchoolDetails)  // GET details for a specific school
    .post('/add-new-school', addNewSchool)  // POST to add a new school
    .post('/:id/update-school', updateSchoolDetails)  // POST to update a specific school
    .post('/:id/update-school-status', updateSchoolStatus);  // POST to update school status


export default schoolRouter;
