import { addNewSchedule, getSchedules, removeSchedule, updateScheduleDetails, viewScheduleDetails, } from '../controllers/scheduleController.js';
import { customRouter } from '../controllers/sharedController.js';
const scheduleRouter = customRouter()

scheduleRouter
    .post('/add-new-schedule', addNewSchedule) // add new schedule
    .get('/', getSchedules) // GET  schedules
    .get('/:schedule_id/view-schedule-details', viewScheduleDetails) // view schedule details
    .post('/:schedule_id/update-schedule', updateScheduleDetails) // update schedule details
    .delete('/:schedule_id/delete-schedule', removeSchedule) // delete schedule 

export default scheduleRouter;
