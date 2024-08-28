import mongoose from "mongoose";
import Student from "../models/studentModel.js";
import { calculateAge, getRandomColor } from "../utils/helper.js"
import { getSequenceId, validateSchoolAndAdmin } from "./sharedController.js";
export const getAllStudents = async (req, res) => {
    const { page = 1, student_first_name, sort_by, student_classes, age } = req.query;
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;
    const students_per_page = 15;
    const skipStudents = students_per_page * (page - 1);
    let sortBy = {};
    let query = { school_id: school._id };
    if (student_first_name) {
        query.student_first_name = new RegExp(student_first_name, "i");
    }
    if (student_classes) {
        const classesArray = Array.isArray(student_classes) ? student_classes : [student_classes];
        query.student_class = { $in: classesArray };
    }
    if (age) {
        const ageArray = Array.isArray(age) ? age : [age];
        query.student_age = { $in: ageArray };
    }
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
    const last_page_url = `/schools/:school_id/students?page=${lastPage}`;
    try {
        const studentsList = await Student.find(query)
            .limit(students_per_page)
            .skip(skipStudents)
            .sort(sortBy);
        res.status(200).json({
            students: studentsList,
            per_page: students_per_page,
            last_page_url,
            school: school,
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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;
    try {
        const existingStudent = await Student.findOne({ student_email });
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const sc_enroll_id = await getSequenceId(school._id, "student")
        const profile_color = getRandomColor();
        const student_age = calculateAge(date_of_birth);
        const student_status = "active";
        const newStudent = new Student({
            student_first_name,
            student_last_name,
            date_of_birth, student_age,
            student_email,
            student_class,
            student_status,
            address,
            parent_first_name,
            parent_last_name,
            phone,
            parent_email,
            payment,
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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;
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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;
    const { student_id: studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }
    const {
        student_first_name,
        student_last_name,
        date_of_birth,
        student_email,
        student_class,
        student_status,
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
        const student_age = calculateAge(date_of_birth)
        existingStudent.student_first_name = student_first_name || existingStudent.student_first_name;
        existingStudent.student_last_name = student_last_name || existingStudent.student_last_name;
        existingStudent.date_of_birth = date_of_birth || existingStudent.date_of_birth;
        existingStudent.student_age = student_age || existingStudent.student_age;
        existingStudent.student_class = student_class || existingStudent.student_class;
        existingStudent.student_status = student_status || existingStudent.student_status;
        existingStudent.address = address || existingStudent.address;
        existingStudent.parent_first_name = parent_first_name || existingStudent.parent_first_name;
        existingStudent.parent_last_name = parent_last_name || existingStudent.parent_last_name;
        existingStudent.phone = phone || existingStudent.phone;
        existingStudent.parent_email = parent_email || existingStudent.parent_email;
        existingStudent.payment = payment || existingStudent.payment;

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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;
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
