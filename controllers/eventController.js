import mongoose from "mongoose";
import Event from "../models/eventModel.js";
export const getAllEvents = async (req, res) => {
    const { page = 1, event_name, sort_by, event_status } = req.query;
    const events_per_page = 15;
    const skipEvents = events_per_page * (page - 1);
    let query = {};
    if (event_name) {
        query.event_name = new RegExp(event_name, "i");
    }
    if (event_status) {
        if (event_status === "on_going") {
            query.event_start_date = { $lte: Date.now() };
            query.event_end_date = { $gte: Date.now() };
        } else if (event_status === "up_coming") {
            query.event_start_date = { $gt: Date.now() };
        } else if (event_status === "completed") {
            query.event_end_date = { $lt: Date.now() };
        }
    }
    let sortBy = {};
    if (sort_by) {
        if (sort_by === "newest") {
            sortBy.createdAt = -1;
        } else if (sort_by === "updatedAt") {
            sortBy.updatedAt = -1;
        } else if (sort_by === "alphabetically") {
            sortBy.event_name = 1;
        }
    }
    const totalEvents = await Event.countDocuments(query);
    const lastPage = Math.ceil(totalEvents / events_per_page);
    const last_page_url = `/events?page=${lastPage}`;
    try {
        const eventsList = await Event.find(query)
            .limit(events_per_page)
            .skip(skipEvents)
            .sort(sortBy);
        res.status(200).json({
            events: eventsList,
            per_page: events_per_page,
            last_page_url,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addNewEvent = async (req, res) => {
    const {
        event_name,
        event_organizer,
        event_description,
        event_start_date,
        event_end_date,
        event_time,
        event_location,
        event_type,
        class_name,
    } = req.body;

    try {
        if (event_type === "Class-Specific" && !class_name) {
            return res.status(400).json({ message: "class_name is required for Class-Specific events." });
        }

        const newEvent = new Event({
            event_name,
            event_organizer,
            event_description,
            event_start_date,
            event_end_date,
            event_time,
            event_location,
            event_type,
            class_name: event_type === "Class-Specific" ? class_name : undefined,
        });

        const savedEvent = await newEvent.save();

        res.status(201).json({
            id: savedEvent._id,
            event_name: savedEvent.event_name,
            event_organizer: savedEvent.event_organizer,
            event_description: savedEvent.event_description,
            event_start_date: savedEvent.event_start_date,
            event_end_date: savedEvent.event_end_date,
            event_time: savedEvent.event_time,
            event_location: savedEvent.event_location,
            event_type: savedEvent.event_type,
            class_name: savedEvent.class_name,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const viewEventDetails = async (req, res) => {
    const { id: eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
    }
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({
            event_details: event
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving event details" });
    }
};
export const updateEvent = async (req, res) => {
    const { id: eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid Event ID" });
    }
    const {
        event_name,
        event_organizer,
        event_description,
        event_start_date,
        event_end_date,
        event_time,
        event_location,
        event_type,
        class_name,
    } = req.body;

    try {
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        const isNewClassSpecific = event_type === "Class-Specific";
        if (isNewClassSpecific && !class_name) {
            return res.status(400).json({ message: "class_name is required for Class-Specific events" });
        }
        existingEvent.event_name = event_name || existingEvent.event_name;
        existingEvent.event_organizer = event_organizer || existingEvent.event_organizer;
        existingEvent.event_description = event_description || existingEvent.event_description;
        existingEvent.event_start_date = event_start_date || existingEvent.event_start_date;
        existingEvent.event_end_date = event_end_date || existingEvent.event_end_date;
        existingEvent.event_time = event_time || existingEvent.event_time;
        existingEvent.event_location = event_location || existingEvent.event_location;
        if (isNewClassSpecific) {
            existingEvent.class_name = class_name;
        } else {
            existingEvent.class_name = undefined;
        }
        existingEvent.event_type = event_type || existingEvent.event_type;
        const updatedEvent = await existingEvent.save();
        res.status(200).json({
            id: updatedEvent._id,
            event_name: updatedEvent.event_name,
            event_organizer: updatedEvent.event_organizer,
            event_description: updatedEvent.event_description,
            event_start_date: updatedEvent.event_start_date,
            event_end_date: updatedEvent.event_end_date,
            event_time: updatedEvent.event_time,
            event_location: updatedEvent.event_location,
            event_type: updatedEvent.event_type,
            class_name: updatedEvent.class_name,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const removeEvent = async (req, res) => {
    const { id: eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid Event ID" });
    }
    try {
        const existingEvent = await Event.findByIdAndDelete(eventId);
        if (!existingEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        return res.status(200).json({ message: "Event deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while deleting the Event" });
    }
};
