import mongoose from "mongoose";
import Teacher from "../models/teacherModel.js";
import { getRandomColor } from "../utils/helper.js"
export const getAllTeachers = async (req, res) => {
    const { page = 1, first_name, order_by } = req.query;
    const teachers_per_page = 15;
    const skipTeachers = teachers_per_page * (page - 1);
    let query = {};
    if (first_name) {
        query.first_name = new RegExp(first_name, "i");
    }
    const totalTeachers = await Teacher.countDocuments(query);
    const lastPage = Math.ceil(totalTeachers / teachers_per_page);
    const last_page_url = `/teachers?page=${lastPage}`;
    try {
        const teachersList = await Teacher.find(query)
            .limit(teachers_per_page)
            .skip(skipTeachers)
            .sort(order_by);
        res.status(200).json({
            teachers: teachersList,
            per_page: teachers_per_page,
            last_page_url,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addNewTeacher = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        date_of_birth,
        university,
        degree,
        degree_start_date,
        degree_end_date,
        city,
    } = req.body;

    try {
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already exists" });
        }
        const profile_color = getRandomColor();
        const newTeacher = new Teacher({
            first_name,
            last_name,
            email,
            phone,
            address,
            date_of_birth,
            university,
            degree,
            degree_start_date,
            degree_end_date,
            city,
            profile_color,
        });
        const savedTeacher = await newTeacher.save();

        res.status(201).json({
            id: savedTeacher._id,
            first_name: savedTeacher.first_name,
            last_name: savedTeacher.last_name,
            email: savedTeacher.email,
            phone: savedTeacher.phone,
            address: savedTeacher.address,
            date_of_birth: savedTeacher.date_of_birth,
            university: savedTeacher.university,
            degree: savedTeacher.degree,
            degree_start_date: savedTeacher.degree_start_date,
            degree_end_date: savedTeacher.degree_end_date,
            city: savedTeacher.city,
            profile_color: savedTeacher.profile_color,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const viewTeacherDetails = async (req, res) => {
    const { id: teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
    }
    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({
            teacher_details: teacher
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving teacher details" });
    }
};
export const updateTeacher = async (req, res) => {
    const { id: teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid Teacher ID" });
    }
    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        date_of_birth,
        university,
        degree,
        degree_start_date,
        degree_end_date,
        city,
    } = req.body;

    try {
        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        if (email && email !== existingTeacher.email) {
            const emailExists = await Teacher.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use by another teacher" });
            }
            existingTeacher.email = email;
        }

        existingTeacher.first_name = first_name || existingTeacher.first_name;
        existingTeacher.last_name = last_name || existingTeacher.last_name;
        existingTeacher.phone = phone || existingTeacher.phone;
        existingTeacher.address = address || existingTeacher.address;
        existingTeacher.date_of_birth = date_of_birth || existingTeacher.date_of_birth;
        existingTeacher.university = university || existingTeacher.university;
        existingTeacher.degree = degree || existingTeacher.degree;
        existingTeacher.degree_start_date = degree_start_date || existingTeacher.degree_start_date;
        existingTeacher.degree_end_date = degree_end_date || existingTeacher.degree_end_date;
        existingTeacher.city = city || existingTeacher.city;
        const updatedTeacher = await existingTeacher.save();

        res.status(200).json({
            id: updatedTeacher._id,
            first_name: updatedTeacher.first_name,
            last_name: updatedTeacher.last_name,
            email: updatedTeacher.email,
            phone: updatedTeacher.phone,
            address: updatedTeacher.address,
            date_of_birth: updatedTeacher.date_of_birth,
            university: updatedTeacher.university,
            degree: updatedTeacher.degree,
            degree_start_date: updatedTeacher.degree_start_date,
            degree_end_date: updatedTeacher.degree_end_date,
            city: updatedTeacher.city,
            profile_color: updatedTeacher.profile_color,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const removeTeacher = async (req, res) => {
    const { id: teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid Teacher ID" });
    }
    try {
        const existingTeacher = await Teacher.findByIdAndDelete(teacherId);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        return res.status(200).json({ message: "Teacher deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while deleting the Teacher" });
    }
};
