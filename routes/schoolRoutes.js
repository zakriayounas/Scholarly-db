import express from 'express';
import { addNewSchool, getAllSchools, updateSchoolDetails, updateSchoolStatus, viewSchoolDetails } from '../controllers/schoolController.js';
const schoolRouter = express.Router();
schoolRouter.get('/', getAllSchools);
schoolRouter.post('/add-new-school', addNewSchool);
schoolRouter.get('/view-school-details/:id', viewSchoolDetails);
schoolRouter.post('/update-school/:id', updateSchoolDetails);
schoolRouter.post('/update-school-status', updateSchoolStatus);

export default schoolRouter;
