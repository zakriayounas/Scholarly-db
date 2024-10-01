import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import { calculateAge, getRandomColor } from "../utils/helper.js";
import { getSequenceId } from "./sharedController.js";
export const getAllStudents = async (req, res) => {
    const { page = 1, first_name, sort_by, student_classes, age } = req.query;

    const school = req.school;
    const students_per_page = 15;
    const skipStudents = students_per_page * (page - 1);
    let sortBy = {};
    let query = { school_id: school._id };

    // Filter by first name
    if (first_name) {
        query.first_name = new RegExp(first_name, "i");  // Case-insensitive search
    }

    // Filter by classes
    if (student_classes) {
        const classesArray = Array.isArray(student_classes) ? student_classes : [student_classes];
        query.class_name = { $in: classesArray };
    }

    // Filter by age
    if (age) {
        const ageArray = Array.isArray(age) ? age : [age];
        query.student_age = { $in: ageArray };
    }

    // Sorting logic
    if (sort_by) {
        if (sort_by === "newest") {
            sortBy.createdAt = -1;
        } else if (sort_by === "updatedAt") {
            sortBy.updatedAt = -1;
        } else if (sort_by === "alphabetically") {
            sortBy.first_name = 1;  // Sort by first_name alphabetically
        }
    }

    const totalStudents = await Student.countDocuments(query);
    const lastPage = Math.ceil(totalStudents / students_per_page);
    const last_page_url = `/schools/${school._id}/students?page=${lastPage}`;

    try {
        const studentsList = await Student.find(query)
            .select('-payment -b_form -cnic_number -gender -date_of_birth -student_age -address')
            .limit(students_per_page)
            .skip(skipStudents)
            .sort(sortBy);

        res.status(200).json({
            students: studentsList,
            per_page: students_per_page,
            total_items: totalStudents,
            last_page_url,
            school: school,
        });
    } catch (error) {
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
        student_status,
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
            student_status,
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
    const { student_id: studentId, student_status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        existingStudent.student_status = student_status || existingStudent.student_status;
        const updatedStudent = await existingStudent.save();
        res.status(200).json({
            message: "Student status updated successfully!",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
