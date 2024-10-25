import { addNewSchool, getAllSchools, updateSchoolDetails, updateSchoolStatus, viewSchoolDetails } from '../controllers/schoolController.js';
import { customRouter } from '../controllers/sharedController.js';
import { validateSchoolAndAdmin } from '../middlewares/middlewares.js';
const schoolRouter = customRouter()

schoolRouter
    .get('/', getAllSchools)  // GET all schools
    .get('/:school_id/view-school-details', validateSchoolAndAdmin, viewSchoolDetails)  // GET details for a specific school
    .post('/add-new-school', addNewSchool)  // POST to add a new school
    .post('/:school_id/update-school', validateSchoolAndAdmin, updateSchoolDetails)  // POST to update a specific school
    .post('/:school_id/update-school-status', validateSchoolAndAdmin, updateSchoolStatus);  // POST to update school status


export default schoolRouter;
