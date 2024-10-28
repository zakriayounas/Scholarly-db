import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SchoolClass",
            required: true,
        },
        schedule_description: {
            type: String,
            default: function () {
                return this.subject;
            },
        },
        start_time: {
            type: String, // Could also be Date if you're handling more complex scheduling
            required: true,
        },
        end_time: {
            type: String,
            required: true,
        },
        days: {
            type: [String],
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
