import { addNewEvent, getAllEvents, removeEvent, updateEventDetails, viewEventDetails } from '../controllers/eventController.js';
import { customRouter } from '../controllers/sharedController.js';
const eventRouter = customRouter()

eventRouter
    .get('/', getAllEvents)  // GET all events
    .get('/view-event-details/:event_id', viewEventDetails)  // GET specific event details
    .post('/add-new-event', addNewEvent)  // POST new event
    .post('/update-event/:event_id', updateEventDetails)  // POST to update event
    .delete('/delete-event/:event_id', removeEvent);  // DELETE specific event


export default eventRouter;
