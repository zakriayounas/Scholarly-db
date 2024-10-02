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
export const handleFetchQuery = (req) => {
    const { page = 1, first_name, sort_by, class_name, age, status, teacher_type } = req.query;
    const school = req.school;

    const items_per_page = 20;
    const skip_items = items_per_page * (page - 1);
    let sortBy = {};
    let query = { school_id: school._id };  // Query includes filtering by school

    // Filter by first name
    if (first_name) {
        query.first_name = new RegExp(first_name, "i");  // Case-insensitive search
    }

    // Filter by classes
    if (class_name) {
        const classesArray = Array.isArray(class_name) ? class_name : [class_name];
        query.class_name = { $in: classesArray };  // Filter by class
    }

    // Filter by Teacher type (for teachers)
    if (teacher_type === "specialized") {
        query.is_specialized = true;
    } else if (teacher_type === "general") {
        query.is_specialized = false;
    }

    // Filter by age
    if (age) {
        const ageArray = Array.isArray(age) ? age : [age];
        query.student_age = { $in: ageArray };  // Filter by age range
    }

    // Handle multiple sort_by values
    if (sort_by) {
        const sortArray = Array.isArray(sort_by) ? sort_by : [sort_by];

        sortArray.forEach(sortOption => {
            if (sortOption === "newest") {
                sortBy.createdAt = -1;  // Newest first
            } else if (sortOption === "updatedAt") {
                sortBy.updatedAt = -1;  // Recently updated first
            } else if (sortOption === "alphabetically") {
                sortBy.first_name = 1;  // Sort alphabetically
            }
        });
    }

    // Filter by status (for students)
    if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        query.status = { $in: statusArray };  // Filter by student status
    }

    // Return all relevant data
    return {
        query,
        sortBy,
        school,
        items_per_page,
        skip_items
    };
};
