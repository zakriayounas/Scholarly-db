import { customRouter } from '../controllers/sharedController.js';
import { validateSchoolAndAdmin } from '../middlewares/middlewares.js';
import classRouter from './classRoutes.js';
import draftRouter from './draftRoutes.js';
import eventRouter from './eventRoutes.js';
import sectionRoutes from './sectionRoutes.js';
import studentRouter from './studentRoutes.js';
import teacherRouter from './teacherRoutes.js';

// Initialize the custom router
const schoolNestedRouter = customRouter();

// Apply validateSchoolAndAdmin middleware to all nested routes
schoolNestedRouter.use(validateSchoolAndAdmin);

// Define the nested routes for a school
schoolNestedRouter
    .use('/teachers', teacherRouter)
    .use('/students', studentRouter)
    .use('/events', eventRouter)
    .use('/drafts', draftRouter)
    .use('/classes', classRouter)
    .use('/class-sections', sectionRoutes);

// Export the schoolNestedRouter instead of just studentRouter
export default schoolNestedRouter;
