import moment from "moment";
import Schedule from "../models/scheduleModel.js";
import {
    formatObjWithClassDetails,
    getItemById,
    populateClassIdField,
    populateTeacherField,
} from "./sharedController.js";

// Helper function to format a schedule object
const handleFormatScheduleObject = async (schedule_id) => {
    const schedule = await getItemById(schedule_id, "schedule", [
        populateClassIdField,
        populateTeacherField("instructor"),
    ]);
    return formatObjWithClassDetails(schedule);
};

// handle schedule query
export const handleScheduleQuery = async (req) => {
    const { instructor, class_id, show_full_week } = req.query; // Change to query parameters

    // Get the current day in the format matching your schema (e.g., "Mon", "Tue")
    const currentDay = moment().format("ddd"); // "ddd" gives three-letter day format like "Mon"

    // Create a query object
    const query = {};
    if (class_id) {
        query.class_id = class_id;
    }
    if (instructor) {
        query.instructor = instructor;
    }

    // If show_full_week is not true, filter by the current day
    if (!show_full_week) {
        query.days = currentDay;
    }

    // Initialize an array for populate options
    const populateOptions = [populateClassIdField];

    // Add class population if class_id is present
    if (class_id) {
        populateOptions.push(populateTeacherField("instructor"));
    }

    // Fetch schedules based on the query
    const schedules = await Schedule.find(query)
        .select(instructor ? "-instructor" : "")  // excluded instructor in case of instructor own schedule
        .populate(populateOptions).lean(); // Adjust populate as needed

    // Format the schedules if needed
    const formattedSchedules = schedules.map((sch) => formatObjWithClassDetails(sch)); // Adjust formatting as necessary
    return formattedSchedules;
};

// Function to check schedule conflict
const checkScheduleConflict = async (req) => {
    const { instructor, days, start_time, end_time, class_id } = req.body;

    // Convert start_time and end_time to a comparable format using moment
    const newStartTime = moment(start_time, "hh:mm A");
    const newEndTime = moment(end_time, "hh:mm A");

    // Step 1: Check for existing schedules for the specified class on the specified days
    const classSchedules = await Schedule.find({
        class_id: class_id,
        days: { $in: days },
    });

    // Loop through the found class schedules and check for time conflicts
    for (const schedule of classSchedules) {
        const existingStartTime = moment(schedule.start_time, "hh:mm A");
        const existingEndTime = moment(schedule.end_time, "hh:mm A");

        // Check if the new schedule overlaps with an existing one for the class
        const classHasConflict =
            (newStartTime.isBefore(existingEndTime) &&
                newStartTime.isSameOrAfter(existingStartTime)) ||
            (newEndTime.isAfter(existingStartTime) &&
                newEndTime.isSameOrBefore(existingEndTime));

        if (classHasConflict) {
            return "Class already has a schedule during this time slot."; // Conflict detected for the class
        }
    }

    // Step 2: Check if the selected teacher has any schedules on the specified days
    const teacherSchedules = await Schedule.find({
        instructor: instructor,
        days: { $in: days },
    });

    // Loop through the found teacher schedules and check for time conflicts
    for (const schedule of teacherSchedules) {
        const existingStartTime = moment(schedule.start_time, "hh:mm A");
        const existingEndTime = moment(schedule.end_time, "hh:mm A");

        // Check if the new schedule overlaps with an existing one for the teacher
        const teacherHasConflict =
            (newStartTime.isBefore(existingEndTime) &&
                newStartTime.isSameOrAfter(existingStartTime)) ||
            (newEndTime.isAfter(existingStartTime) &&
                newEndTime.isSameOrBefore(existingEndTime));

        if (teacherHasConflict) {
            return "The selected teacher already has a schedule during this time slot.";
        }
    }

    return null; // No conflicts
};

// to get schedules based on query parameters
export const getSchedules = async (req, res) => {
    const { show_full_week } = req.query
    try {
        // Use the shared query handler for fetching schedules
        const schedules = await handleScheduleQuery(req);

        const currentDay = moment().format('dddd, MMM D, YYYY');

        // Prepare the message to send for full week or current day
        const message = show_full_week ? "Full Week Schedule" : currentDay;

        // Return the schedules
        res.status(200).json({ schedules, message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// add new schedule
export const addNewSchedule = async (req, res) => {
    try {
        // Check if there are any conflicts
        const conflictMessage = await checkScheduleConflict(req);
        if (conflictMessage) {
            return res
                .status(400)
                .json({ conflictMessage: true, message: conflictMessage });
        }
        // If no conflict, save the new schedule
        const schedule = new Schedule(req.body);
        await schedule.save();

        const formattedSchedule = await handleFormatScheduleObject(schedule._id); // Format the newly added schedule
        res.status(201).json({ message: "Schedule added successfully", schedule: formattedSchedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// view schedule details
export const viewScheduleDetails = async (req, res) => {
    const { schedule_id } = req.params;

    try {
        const formattedSchedule = await handleFormatScheduleObject(schedule_id);
        res.status(200).json({ schedule: formattedSchedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update schedule details
export const updateScheduleDetails = async (req, res) => {
    const { schedule_id } = req.params;

    try {
        const scheduleToUpdate = await getItemById(schedule_id, "schedule");

        const conflictMessage = await checkScheduleConflict(req);
        if (conflictMessage) {
            return res.status(400).json({ conflictMessage: true, message: conflictMessage });
        }

        Object.assign(scheduleToUpdate, req.body);
        await scheduleToUpdate.save();

        const formattedUpdatedSchedule = await handleFormatScheduleObject(schedule_id); // Format the updated schedule
        res.status(200).json({ message: "Schedule updated successfully", schedule: formattedUpdatedSchedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete schedule
export const removeSchedule = async (req, res) => {
    const { schedule_id } = req.params; // Extract the schedule ID from the request parameters

    try {
        // Attempt to find and delete the schedule by ID
        const deletedSchedule = await Schedule.findByIdAndDelete(schedule_id);

        // Check if a schedule was found and deleted
        if (!deletedSchedule) {
            return res.status(404).json({ message: "Schedule not found." });
        }

        // Return a success response if deletion was successful
        res.status(200).json({ message: "Schedule deleted successfully." });
    } catch (error) {
        // Handle any errors that occur during the deletion process
        res.status(500).json({ message: error.message });
    }
};


