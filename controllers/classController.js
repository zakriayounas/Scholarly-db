import SchoolClass from "../models/classModel.js";
import { getItemById, handleFetchQuery } from "./sharedController.js";
import mongoose from "mongoose";
// handling  default value of class
const handleDefaultClass = async ({ class_name, school_id }) => {
    try {
        const existingDefaultClass = await SchoolClass.findOne({ class_name, is_default: true, school_id });
        if (existingDefaultClass) {
            existingDefaultClass.is_default = false;
            await existingDefaultClass.save();
        }
    } catch (error) {
        throw new Error("Error updating default class logic: " + error.message);
    }
};


// handling class multiple sections value
const handleClassMultiSection = async (class_name, school_id) => {
    try {
        const classWithSameName = await SchoolClass.find({ class_name, school_id });
        if (classWithSameName.length > 0) {
            await SchoolClass.updateMany({ class_name, school_id }, { has_multiple_sections: true });
        }
        return classWithSameName.length > 0; // True if sections exist
    } catch (error) {
        throw new Error("Error handling multi-section class: " + error.message);
    }
};



// get school classes
export const getSchoolClasses = async (req, res) => {
    const { query, sortBy, school, items_per_page, skip_items } = await handleFetchQuery(req);

    try {
        // Count total number of schoolClasses matching the query
        const totalClasses = await SchoolClass.countDocuments(query);

        // Calculate the last page
        const lastPage = Math.ceil(totalClasses / items_per_page);
        const last_page_url = `/schools/${school._id}/classes?page=${lastPage}`;

        // Fetch schoolClasses from the database with pagination and sorting
        const classesList = await SchoolClass.find(query)
            .populate({
                path: 'section',
                select: '-school_id ', // Specify the fields you want from Section
            })
            .populate({
                path: 'class_admin',
                select: 'first_name last_name profile_color profile_image', // Specify the fields you want from Class Admin (Teacher)
            })
            .limit(items_per_page)
            .skip(skip_items)
            .sort(sortBy);

        // Return the schoolClasses data in the response
        res.status(200).json({
            schoolClasses: classesList,
            per_page: items_per_page,
            total_items: totalClasses,
            last_page_url,
            school: school,  // Including the school object
        });
    } catch (error) {
        // Handle any errors
        res.status(400).json({ message: error.message });
    }
};

// Add a new class
export const addNewClass = async (req, res) => {
    const { class_name, school_id, is_default } = req.body;

    try {
        // Handle default class
        if (is_default) {
            await handleDefaultClass({ class_name, school_id });
        }

        // Handle class multi-section logic
        const has_multiple_sections = await handleClassMultiSection(class_name, school_id);

        // Create and save new class
        const newClass = new SchoolClass({
            ...req.body, has_multiple_sections
        });
        const savedClass = await newClass.save();

        res.status(201).json({ message: "Class added successfully!", class: savedClass });
    } catch (error) {
        const statusCode = error.code === 11000 ? 400 : 500; // Handle duplicate and general errors
        res.status(statusCode).json({ message: error.code === 11000 ? "Class already exists!" : error.message });
    }
};

// view details of single class
export const viewClassDetails = async (req, res) => {
    const { class_id: classId } = req.params;

    try {
        // Find the class by its ID and populate related fields (section and class_admin)
        const populateClassDetails = [
            {
                path: 'section',
                select: '-school_id', // Specify the fields you want from Section
            },
            {
                path: 'class_admin',
                select: 'first_name last_name profile_color profile_image', // Specify the fields you want from Class Admin (Teacher)
            }
        ];

        const existingClass = await getItemById(classId, "class", populateClassDetails);
        // Return the class details
        res.status(200).json({ class: existingClass });
    } catch (error) {
        // Handle any server errors
        res.status(500).json({ message: "An error occurred while retrieving class details" });
    }
};

// Update class details
export const updateClassDetails = async (req, res) => {
    const { class_id } = req.params;
    const { section_id, class_admin, class_capacity, is_default } = req.body;
    const existingClass = await getItemById(class_id, "class")
    try {
        // Handle default class logic
        if (is_default) {
            await handleDefaultClass({ class_name: existingClass.class_name, school_id: existingClass.school_id });
        }

        // Update class details
        existingClass.section = section_id || existingClass.section;
        existingClass.class_admin = class_admin || existingClass.class_admin;
        existingClass.class_capacity = class_capacity || existingClass.class_capacity;
        existingClass.is_default = is_default !== undefined ? is_default : existingClass.is_default;

        const updatedClass = await existingClass.save();

        res.status(200).json({ message: "Class details updated successfully!", class: updatedClass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// remove selected class and move it's data to new selected class
export const removeClassAndTransferStudents = async (req, res) => {
    const { prev_class_id, new_class_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(prev_class_id) || !mongoose.Types.ObjectId.isValid(new_class_id)) {
        return res.status(400).json({ message: "Invalid Class ID(s)" });
    }

    try {
        const [existingClass, newClass] = await Promise.all([
            SchoolClass.findById(prev_class_id),
            SchoolClass.findById(new_class_id)
        ]);

        if (!existingClass) return res.status(404).json({ message: "Class to be removed not found" });
        if (!newClass) return res.status(404).json({ message: "New class not found" });

        const totalStudentsToMove = existingClass.active_students_count || 0;
        const availableCapacityInNewClass = newClass.class_capacity - newClass.active_students_count;

        if (availableCapacityInNewClass < totalStudentsToMove) {
            return res.status(400).json({ message: `New class doesn't have enough capacity (${availableCapacityInNewClass})` });
        }

        // Move students, update class capacity, set new default if needed
        await Student.updateMany({ class_id: prev_class_id }, { class_id: new_class_id });
        newClass.active_students_count += totalStudentsToMove;
        if (existingClass.is_default) {
            newClass.is_default = true;
            await newClass.save();
        }


        // Check for other classes with the same name
        const remainingClasses = await SchoolClass.find({
            class_name: existingClass.class_name, school_id: existingClass.school_id, _id: { $ne: new_class_id }
        });
        if (remainingClasses.length === 0) {
            newClass.has_multiple_sections = false;
            await newClass.save();
        }

        // Finally, delete the old class
        await SchoolClass.findByIdAndDelete(prev_class_id);

        res.status(200).json({ message: "Class removed successfully, students moved to the new class!", updated_class: newClass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
