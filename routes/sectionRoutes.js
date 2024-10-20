import { addNewSection, getSchoolSections, updateSectionDetails, viewSectionDetails } from '../controllers/sectionController.js';
import { customRouter } from '../controllers/sharedController.js';
const sectionRoutes = customRouter()

sectionRoutes
    .get('/', getSchoolSections)  // GET school sections
    .get('/:section_id/view-section-details', viewSectionDetails)  // GET details for a specific section
    .post('/add-new-section', addNewSection)  // POST to add a new section
    .post('/:section_id/update-section', updateSectionDetails)  // POST to update a specific section


export default sectionRoutes;
