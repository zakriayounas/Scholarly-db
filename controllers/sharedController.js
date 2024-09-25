import express from 'express';
import Counter from "../models/counterModel.js";

// getting enroll_id in school
export const getSequenceId = async (schoolId, type) => {
    const updateField = type === "student" ? "student_sequence" : "teacher_sequence";
    const counter = await Counter.findOneAndUpdate(
        { school_id: schoolId },
        { $inc: { [updateField]: 1 } },
        { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    return counter[updateField];
};
// utils/createRouter.js
export const customRouter = () => {
    return express.Router({ mergeParams: true });
};
