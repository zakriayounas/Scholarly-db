import mongoose from "mongoose";

const teacherAssignmentSchema = new mongoose.Schema(
    {
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        is_specialized: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const scheduleSchema = new mongoose.Schema(
    {
        schedule_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        schedule_teacher: {
            type: teacherAssignmentSchema,
            required: true,
        },
        schedule_description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        schedule_duration: {
            type: String,
            enum: ["30min", "40min", "50min", "60min"],
            default: "40min",
        },
    },
    {
        timestamps: true,
    }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
