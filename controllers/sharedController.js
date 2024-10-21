import express from 'express';
import Counter from "../models/counterModel.js";
import { parseQueryArray } from '../utils/helper.js';
import SchoolClass from '../models/classModel.js';
import mongoose from 'mongoose';
import Student from '../models/studentModel.js';

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

// custom Router for mergeParam config
export const customRouter = () => {
    return express.Router({ mergeParams: true });
};

// custom query to handle filters 
export const handleFetchQuery = async (req, classId) => {
    const { page = 1, first_name, sort_by, class_name, status, teacher_type, gender, event_organizer, event_categories, event_statuses, event_type } = req.query;
    const school = req.school;
    const ITEMS_PER_PAGE = 20;
    const skipItems = ITEMS_PER_PAGE * (page - 1);  // Pagination logic

    let query = { school_id: school._id };  // Initial query includes school filter

    // Add class_id filter only if it's provided
    if (classId) {
        // Validate classId by checking if it exists in the database
        const classExists = await SchoolClass.exists({ _id: classId, school_id: school._id }); // Ensure it's from the same school
        if (!classExists) {
            return { error: true, message: "Invalid class ID." }; // Return an error response
        }
    }
    if (classId) {
        query.class_id = classId;
    }

    let sortBy = { createdAt: -1 };  // Sorting object

    // Helper function for case-insensitive search with RegExp
    const createRegExpFilter = (field, value) => {
        if (value) query[field] = new RegExp(value, "i");
    };

    // Filter by first name (case-insensitive)
    createRegExpFilter('first_name', first_name);

    // Filter by class names
    if (class_name) {
        const classArray = parseQueryArray(class_name);
        query.class_name = { $in: classArray.map(cl => cl.trim()) };
    }

    // Filter by event type
    if (event_type) {
        const eventTypesArray = parseQueryArray(event_type);
        query.event_type = { $in: eventTypesArray.map(et => et.trim()) };
    }

    // Filter by event category
    if (event_categories) {
        const eventCategoriesArray = parseQueryArray(event_categories);
        query.event_category = { $in: eventCategoriesArray.map(ec => ec.trim()) };
    }


    // Filter by event organizer
    if (event_organizer) {
        const eventOrganizersArray = parseQueryArray(event_organizer);
        query.event_organizer = { $in: eventOrganizersArray.map(eo => eo.trim()) };
    }

    // Filter by gender
    if (gender) {
        const genderArray = parseQueryArray(gender);
        query.gender = { $in: genderArray.map(g => g.trim()) };
    }

    // Filter by teacher type (specialized/general)
    if (teacher_type === "Specialized") {
        query.is_specialized = true;
    } else if (teacher_type === "General") {
        query.is_specialized = false;
    }

    // Sort by multiple criteria
    if (sort_by) {
        const sortArray = parseQueryArray(sort_by);
        sortBy = {};
        const sortOptions = {
            newest: { createdAt: -1 },
            updatedAt: { updatedAt: -1 },
            alphabetically: { first_name: 1 }
        };

        sortArray.forEach(sortOption => {
            if (sortOptions[sortOption]) {
                sortBy = { ...sortBy, ...sortOptions[sortOption] };
            }
        });
    }

    // Filter by student status
    if (status) {
        const statusArray = parseQueryArray(status);
        query.status = { $in: statusArray.map(s => s.trim()) };
    }

    // Return the constructed query and sorting details
    return {
        query,
        sortBy,
        school,
        items_per_page: ITEMS_PER_PAGE,
        skip_items: skipItems
    };
};

// find class by id 
export const getClassById = async (classId, res) => {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
    }
    // Find the new class to which students will be moved
    const existingClass = await SchoolClass.findById(classId);
    if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
    }
    return existingClass
}

// find student by id
export const getStudentById = async (studentId, res) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
    }
    return existingStudent
}