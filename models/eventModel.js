import mongoose from "mongoose";
const eventSchema = new mongoose.Schema(
    {
        event_name: {
            type: String,
            required: true,
            trim: true,
        },
        event_organizer: {
            type: String,
            required: true,
            trim: true,
        },
        event_description: {
            type: String,
            required: true,
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
        event_location: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        event_type: {
            type: String,
            required: true,
            enum: {
                values: ["School-Wide", "Class-Specific", "Cultural", "Sports", "Academic", "Fundraisers"],
                message: '{VALUE} is not a valid event type'
            },
        },
        class_name: {
            type: String,
            required: function () {
                return this.event_type === 'Class-Specific';
            },
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model("event", eventSchema);
export default Event;
