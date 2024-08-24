import express from 'express';
import { addNewEvent, getAllEvents, removeEvent, updateEvent, viewEventDetails } from '../controllers/eventController.js';
const eventRouter = express.Router();
eventRouter.get('/', getAllEvents);
eventRouter.post('/add-new-event', addNewEvent);
eventRouter.get('/view-event-details/:id', viewEventDetails);
eventRouter.post('/update-event/:id', updateEvent);
eventRouter.delete('/delete-event/:id', removeEvent);

export default eventRouter;
