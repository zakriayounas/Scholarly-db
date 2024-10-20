import { addNewEvent, getSchoolEvents, removeEvent, updateEventDetails, viewEventDetails } from '../controllers/eventController.js';
import { customRouter } from '../controllers/sharedController.js';
const eventRouter = customRouter()

eventRouter
    .get('/', getSchoolEvents)  // GET school events
    .get('/:event_id/view-event-details', viewEventDetails)  // GET specific event details
    .post('/add-new-event', addNewEvent)  // POST new event
    .post('/:event_id/update-event', updateEventDetails)  // POST to update event
    .delete('/:event_id/delete-event', removeEvent);  // DELETE specific event


export default eventRouter;
