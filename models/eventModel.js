import mongoose from "mongoose";
import { fieldErrorsValidation } from "../middlewares/middlewares.js";
const eventSchema = new mongoose.Schema(
    {
        event_name: {
            type: String,
            required: true,
            trim: true,
        },
        event_organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        event_description: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        event_start_date: {
            type: Date,
            required: true,
        },
        event_end_date: {
            type: Date,
            required: true,
        },
        event_time: {
            type: String,
            required: true,
        },
        event_type: {
            type: String,
            required: true,
            enum: {
                values: ["School-Wide", "Class-Specific"],
                message: "{VALUE} is not a valid event type",
            },
        },
        event_category: {
            type: String,
            required: true,
            enum: {
                values: ["Cultural", "Sports", "Academic", "Fundraisers", "Others"],
                message: "{VALUE} is not a valid event category",
            },
        },
        class_name: {
            type: String,
            required: function () {
                return this.event_type === "Class-Specific";
            },
        },
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
eventSchema.post('save', fieldErrorsValidation);
const Event = mongoose.model("event", eventSchema);
export default Event;
