import mongoose from "mongoose";
import SchoolClass from "../models/classModel.js";
import Schedule from "../models/scheduleModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import {
    getItemById,
    handleFetchQuery,
    populateTeacherField
} from "./sharedController.js";
// handling  default value of class
const handleDefaultClass = async ({ class_name, school_id }) => {
    try {
        const existingDefaultClass = await SchoolClass.findOne({
            class_name,
            is_default: true,
            school_id,
        });
        if (existingDefaultClass) {
            existingDefaultClass.is_default = false;
            await existingDefaultClass.save();
        }
    } catch (error) {
        throw new Error("Error updating default class logic: " + error.message);
    }
};

// Utility function to fetch class students
const getClassStudents = async (classId) => {
    return Student.find({ class_id: classId })
        .select("first_name last_name profile_color profile_image")
        .limit(12)
        .lean();
};

// Utility function to fetch class teachers
const getClassTeachers = async (classId) => {
    return Schedule.find({ class_id: classId })
        .select("instructor -_id")
        .limit(6)
        .lean();
};

// Helper to format class instructors
const formatInstructor = (instructorId) => {
    return Teacher.findById(instructorId)
        .select("first_name last_name profile_color profile_image")
        .lean();
};

// Helper to format sibling classes
const formatSiblings = (classes) => {
    return classes.map((cl) => ({
        class_name: cl.class_name,
        color: cl.section.color,
        section_name: cl.section.section_name,
    }));
};


// handling class multiple sections value
const handleClassMultiSection = async (class_name, school_id) => {
    try {
        const classWithSameName = await SchoolClass.find({ class_name, school_id });
        if (classWithSameName.length > 0) {
            await SchoolClass.updateMany(
                { class_name, school_id },
                { has_multiple_sections: true }
            );
        }
        return classWithSameName.length > 0; // True if sections exist
    } catch (error) {
        throw new Error("Error handling multi-section class: " + error.message);
    }
};

// get school classes
export const getSchoolClasses = async (req, res) => {
    const { query, sortBy, school, items_per_page, skip_items } =
        await handleFetchQuery(req);

    try {
        // Count total number of schoolClasses matching the query
        const totalClasses = await SchoolClass.countDocuments(query);

        // Calculate the last page
        const lastPage = Math.ceil(totalClasses / items_per_page);
        const last_page_url = `/schools/${school._id}/classes?page=${lastPage}`;

        // Fetch schoolClasses from the database with pagination and sorting
        const classesList = await SchoolClass.find(query)
            .populate({
                path: "section",
                select: "-school_id ", // Specify the fields you want from Section
            })
            .populate({
                path: "class_admin",
                select: "first_name last_name profile_color profile_image", // Specify the fields you want from Class Admin (Teacher)
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
            school: school, // Including the school object
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
        const has_multiple_sections = await handleClassMultiSection(
            class_name,
            school_id
        );

        // Create and save new class
        const newClass = new SchoolClass({
            ...req.body,
            has_multiple_sections,
        });
        const savedClass = await newClass.save();

        res
            .status(201)
            .json({ message: "Class added successfully!", class: savedClass });
    } catch (error) {
        const statusCode = error.code === 11000 ? 400 : 500; // Handle duplicate and general errors
        res.status(statusCode).json({
            message: error.code === 11000 ? "Class already exists!" : error.message,
        });
    }
};

// view details of single class
export const viewClassDetails = async (req, res) => {
    const { class_id: classId } = req.params;
    const school = req.school;

    try {
        // Define the fields to populate (section and class_admin)
        const populateClassDetails = [
            {
                path: "section",
                select: "-school_id", // Exclude school_id from the populated Section field
            },
            populateTeacherField("class_admin"), // Populate the class admin teacher details
        ];

        // Fetch the class details
        const existingClass = await getItemById(classId, "class", populateClassDetails);

        // Fetch class students, limited to 12
        const classStudents = await getClassStudents(classId)

        // Fetch class teachers from the schedule, limited to 6
        const classTeachers = await getClassTeachers(classId)

        // Format the instructor/teacher data
        const formattedTeachers = await Promise.all(
            classTeachers.map(({ instructor }) => formatInstructor(instructor))
        );

        // Fetch sibling classes with the same class name under the same school
        const sibling_classes = await SchoolClass.find({
            school_id: school._id,
            class_name: existingClass.class_name,
            _id: { $ne: existingClass._id }, // Exclude the current class from sibling classes
        }).select('_id class_name').populate('section').lean();

        // formate class sibling
        const formattedClasses = formatSiblings(sibling_classes);
        // Return the class details, including students, teachers, and sibling classes
        res.status(200).json({
            details: {
                ...existingClass,
                students: classStudents,
                teachers: formattedTeachers,
                sibling_classes: formattedClasses,
                subjects: []
            },
        });
    } catch (error) {
        // Handle any server errors
        res.status(500).json({
            message: "An error occurred while retrieving class details",
            error: error.message,
        });
    }
};


// Update class details
export const updateClassDetails = async (req, res) => {
    const { class_id } = req.params;
    const { section_id, class_admin, class_capacity, is_default } = req.body;
    const existingClass = await getItemById(class_id, "class");
    try {
        // Handle default class logic
        if (is_default) {
            await handleDefaultClass({
                class_name: existingClass.class_name,
                school_id: existingClass.school_id,
            });
        }

        // Update class details
        existingClass.section = section_id || existingClass.section;
        existingClass.class_admin = class_admin || existingClass.class_admin;
        existingClass.class_capacity =
            class_capacity || existingClass.class_capacity;
        existingClass.is_default =
            is_default !== undefined ? is_default : existingClass.is_default;

        const updatedClass = await existingClass.save();

        res.status(200).json({
            message: "Class details updated successfully!",
            class: updatedClass,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// remove selected class and move it's data to new selected class
export const removeClassAndTransferStudents = async (req, res) => {
    const { prev_class_id, new_class_id } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(prev_class_id) ||
        !mongoose.Types.ObjectId.isValid(new_class_id)
    ) {
        return res.status(400).json({ message: "Invalid Class ID(s)" });
    }

    try {
        const [existingClass, newClass] = await Promise.all([
            SchoolClass.findById(prev_class_id),
            SchoolClass.findById(new_class_id),
        ]);

        if (!existingClass)
            return res.status(404).json({ message: "Class to be removed not found" });
        if (!newClass)
            return res.status(404).json({ message: "New class not found" });

        const totalStudentsToMove = existingClass.active_students_count || 0;
        const availableCapacityInNewClass =
            newClass.class_capacity - newClass.active_students_count;

        if (availableCapacityInNewClass < totalStudentsToMove) {
            return res.status(400).json({
                message: `New class doesn't have enough capacity (${availableCapacityInNewClass})`,
            });
        }

        // Move students, update class capacity, set new default if needed
        await Student.updateMany(
            { class_id: prev_class_id },
            { class_id: new_class_id }
        );
        newClass.active_students_count += totalStudentsToMove;
        if (existingClass.is_default) {
            newClass.is_default = true;
            await newClass.save();
        }

        // Check for other classes with the same name
        const remainingClasses = await SchoolClass.find({
            class_name: existingClass.class_name,
            school_id: existingClass.school_id,
            _id: { $ne: new_class_id },
        });
        if (remainingClasses.length === 0) {
            newClass.has_multiple_sections = false;
            await newClass.save();
        }

        // Finally, delete the old class
        await SchoolClass.findByIdAndDelete(prev_class_id);

        res.status(200).json({
            message: "Class removed successfully, students moved to the new class!",
            updated_class: newClass,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
