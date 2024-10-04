import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import { calculateAge, getRandomColor } from "../utils/helper.js";
import { getSequenceId, handleFetchQuery } from "./sharedController.js";

export const getAllStudents = async (req, res) => {
    // Destructure the values returned by handleFetchQuery
    const { query, sortBy, school, items_per_page, skip_items } = handleFetchQuery(req);
    try {
        // Count total number of students matching the query
        const totalStudents = await Student.countDocuments(query);

        // Calculate the last page
        const lastPage = Math.ceil(totalStudents / items_per_page);
        const last_page_url = `/schools/${school._id}/students?page=${lastPage}`;

        // Fetch students from the database with pagination and sorting
        const studentsList = await Student.find(query)
            .select('-payment -b_form -cnic_number  -date_of_birth -student_age -address')  // Exclude private fields
            .limit(items_per_page)
            .skip(skip_items)
            .sort(sortBy);

        // Return the students data in the response
        res.status(200).json({
            students: studentsList,
            per_page: items_per_page,
            total_items: totalStudents,
            last_page_url,
            school: school,
        });
    } catch (error) {
        // Handle any errors
        res.status(400).json({ message: error.message });
    }
};


export const addNewStudent = async (req, res) => {
    const { b_form, date_of_birth
    } = req.body;

    const school = req.school;

    try {
        // Generate the student's enrollment ID and other details
        const sc_enroll_id = await getSequenceId(school._id, "student");
        const profile_color = getRandomColor();
        const student_age = calculateAge(date_of_birth);
        const profile_image = req.file ? req.file.path : "";
        // Create a new student
        const newStudent = new Student({
            ...req.body,
            student_age,
            profile_image,
            profile_color,
            school_id: school._id,
            sc_enroll_id
        });

        const savedStudent = await newStudent.save();

        res.status(201).json({
            message: "Student added successfully!",
            student: savedStudent
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const viewStudentDetails = async (req, res) => {

    const school = req.school;

    const { student_id: studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({
            student_details: student,
            school: school
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving student details" });
    }
};
export const updateStudentDetails = async (req, res) => {
    const { student_id: studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    const {
        first_name,
        last_name,
        date_of_birth,
        b_form,
        class_name,
        status,
        gender,
        address,
        parent_first_name,
        parent_last_name,
        phone,
        email,
        payment,
        cnic_number
    } = req.body;

    try {
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (b_form && b_form !== existingStudent.b_form) {
            const bFormExistAlready = await Student.findOne({ b_form });
            if (bFormExistAlready) {
                return res.status(400).json({ message: "B-form already in use by another student" });
            }
            existingStudent.b_form = b_form;
        }
        const profile_image = req.file ? req.file.path : existingTeacher.profile_image;
        const student_age = calculateAge(date_of_birth);
        const fieldsToUpdate = {
            first_name,
            last_name,
            date_of_birth,
            class_name,
            status,
            gender,
            profile_image,
            address,
            parent_first_name,
            parent_last_name,
            phone,
            email,
            payment,
            cnic_number,
            student_age
        };

        Object.keys(fieldsToUpdate).forEach(field => {
            if (fieldsToUpdate[field] !== undefined) {
                existingStudent[field] = fieldsToUpdate[field];
            }
        });

        const updatedStudent = await existingStudent.save();
        res.status(200).json({
            message: "Student updated successfully!",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudentStatus = async (req, res) => {
    const { student_id: studentId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        existingStudent.status = status || existingStudent.status;
        const updatedStudent = await existingStudent.save();
        res.status(200).json({
            message: "Student status updated successfully!",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
