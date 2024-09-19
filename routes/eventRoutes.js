import express from 'express';
import { addNewEvent, getAllEvents, removeEvent, updateEventDetails, viewEventDetails } from '../controllers/eventController.js';
const eventRouter = express.Router();
eventRouter.get('/', getAllEvents);
eventRouter.post('/add-new-event', addNewEvent);
eventRouter.get('/view-event-details/:event_id', viewEventDetails);
eventRouter.post('/update-event/:event_id', updateEventDetails);
eventRouter.delete('/delete-event/:event_id', removeEvent);

export default eventRouter;
