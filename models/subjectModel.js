import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        subject_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        is_compulsory: {
            type: Boolean,
            required: true,
        },
        classes: [{
            type: String,
            ref: "Class",
            required: true
        }]
    },
    {
        timestamps: true,
    }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
