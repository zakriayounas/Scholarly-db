import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import { getRandomColor } from "../utils/helper.js"
export const getAllStudents = async (req, res) => {
    const { page = 1, student_first_name, sort_by } = req.query;
    const students_per_page = 15;
    const skipStudents = students_per_page * (page - 1);

    let query = {};
    if (student_first_name) {
        query.student_first_name = new RegExp(student_first_name, "i");
    }
    let sortBy = {};
    if (sort_by) {
        if (sort_by === "newest") {
            sortBy.createdAt = -1;
        } else if (sort_by === "updatedAt") {
            sortBy.updatedAt = -1;
        } else if (sort_by === "alphabetically") {
            sortBy.student_first_name = 1;
        }
    }
    const totalStudents = await Student.countDocuments(query);
    const lastPage = Math.ceil(totalStudents / students_per_page);
    const last_page_url = `/students?page=${lastPage}`;
    try {
        const studentsList = await Student.find(query)
            .limit(students_per_page)
            .skip(skipStudents)
            .sort(sortBy);
        res.status(200).json({
            students: studentsList,
            per_page: students_per_page,
            last_page_url,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addNewStudent = async (req, res) => {
    const {
        student_first_name,
        student_last_name,
        date_of_birth,
        student_email,
        student_class,
        address,
        parent_first_name,
        parent_last_name,
        phone,
        parent_email,
        payment,
    } = req.body;

    try {
        const existingStudent = await Student.findOne({ student_email });
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const profile_color = getRandomColor();
        const newStudent = new Student({
            student_first_name,
            student_last_name,
            date_of_birth,
            student_email,
            student_class,
            address,
            parent_first_name,
            parent_last_name,
            phone,
            parent_email,
            payment,
            profile_color,
        });
        const savedStudent = await newStudent.save();
        res.status(201).json({
            id: savedStudent._id,
            student_first_name: savedStudent.student_first_name,
            student_last_name: savedStudent.student_last_name,
            date_of_birth: savedStudent.date_of_birth,
            student_email: savedStudent.student_email,
            student_class: savedStudent.student_class,
            address: savedStudent.address,
            parent_first_name: savedStudent.parent_first_name,
            parent_last_name: savedStudent.parent_last_name,
            phone: savedStudent.phone,
            parent_email: savedStudent.parent_email,
            payment: savedStudent.payment,
            profile_color: savedStudent.profile_color,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const viewStudentDetails = async (req, res) => {
    const { id: studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({
            student_details: student
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving student details" });
    }
};
export const updateStudent = async (req, res) => {
    const { id: studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    const {
        student_first_name,
        student_last_name,
        date_of_birth,
        student_email,
        student_class,
        address,
        parent_first_name,
        parent_last_name,
        phone,
        parent_email,
        payment,
    } = req.body;

    try {
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (student_email && student_email !== existingStudent.student_email) {
            const emailExists = await Student.findOne({ student_email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use by another student" });
            }
            existingStudent.student_email = student_email;
        }

        existingStudent.student_first_name = student_first_name || existingStudent.student_first_name;
        existingStudent.student_last_name = student_last_name || existingStudent.student_last_name;
        existingStudent.date_of_birth = date_of_birth || existingStudent.date_of_birth;
        existingStudent.student_class = student_class || existingStudent.student_class;
        existingStudent.address = address || existingStudent.address;
        existingStudent.parent_first_name = parent_first_name || existingStudent.parent_first_name;
        existingStudent.parent_last_name = parent_last_name || existingStudent.parent_last_name;
        existingStudent.phone = phone || existingStudent.phone;
        existingStudent.parent_email = parent_email || existingStudent.parent_email;
        existingStudent.payment = payment || existingStudent.payment;

        const updatedStudent = await existingStudent.save();

        res.status(200).json({
            id: updatedStudent._id,
            student_first_name: updatedStudent.student_first_name,
            student_last_name: updatedStudent.student_last_name,
            date_of_birth: updatedStudent.date_of_birth,
            student_email: updatedStudent.student_email,
            student_class: updatedStudent.student_class,
            address: updatedStudent.address,
            parent_first_name: updatedStudent.parent_first_name,
            parent_last_name: updatedStudent.parent_last_name,
            phone: updatedStudent.phone,
            parent_email: updatedStudent.parent_email,
            payment: updatedStudent.payment,
            profile_color: updatedStudent.profile_color,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const removeStudent = async (req, res) => {
    const { id: studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    try {
        const existingStudent = await Student.findByIdAndDelete(studentId);
        if (!existingStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ message: "Student deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while deleting the student" });
    }
};
