import mongoose from 'mongoose';
import Teacher from '../models/teacherModel.js';
import { getRandomColor } from "../utils/helper.js";
import { getSequenceId, handleFetchQuery } from './sharedController.js';
export const getAllTeachers = async (req, res) => {
    const { query, sortBy, school, items_per_page, skip_items } = handleFetchQuery(req);


    try {
        const totalTeachers = await Teacher.countDocuments(query);
        const lastPage = Math.ceil(totalTeachers / items_per_page);
        const last_page_url = `/schools/${school._id}/teachers?page=${lastPage}`;

        // Fetch teachers based on the query and pagination
        const teachersList = await Teacher.find(query)
            .select('first_name last_name phone email specialized_subjects is_specialized profile_color profile_image')
            .limit(items_per_page)
            .skip(skip_items)
            .sort(sortBy);

        res.status(200).json({
            teachers: teachersList,
            per_page: items_per_page,
            total_items: totalTeachers,
            last_page_url,
            school: school,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addNewTeacher = async (req, res) => {
    const { cnic_number, email } = req.body
    const school = req.school;
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
        return res.status(400).json({ message: "Teacher already exists" });
    }
    const existingTeacherByCnic = await Teacher.findOne({ cnic_number });
    if (existingTeacherByCnic) {
        return res.status(400).json({ message: "Teacher already exists with this CNIC number." });
    }
    const sc_join_id = await getSequenceId(school._id, "teacher")
    const profile_color = getRandomColor();
    const profile_image = req.file ? req.file.path : "";
    const newTeacher = new Teacher({
        ...req.body,
        profile_color,
        profile_image,
        school_id: school._id,
        sc_join_id
    });
    const savedTeacher = await newTeacher.save();

    res.status(201).json({
        message: "Teacher added successfully!",
        teacher: savedTeacher
    });
};
export const viewTeacherDetails = async (req, res) => {
    const { teacher_id: teacherId } = req.params;

    const school = req.school;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
    }
    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({
            teacher_details: teacher,
            school: school
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "An error occurred while retrieving teacher details" });
    }
};
export const updateTeacherDetails = async (req, res) => {
    const { teacher_id: teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid Teacher ID" });
    }

    const {
        first_name,
        last_name,
        email,
        phone,
        address,
        cnic_number,
        gender,
        is_specialized,
        specialized_subjects,
        university,
        degree,
        degree_start_date,
        degree_end_date,
        status,
        degree_city
    } = req.body;

    try {
        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Check for unique email
        if (email && email !== existingTeacher.email) {
            const emailExists = await Teacher.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use by another teacher" });
            }
            existingTeacher.email = email; // Update email if it is new
        }
        const profile_image = req.file ? req.file.path : existingTeacher.profile_image;
        // Fields to update
        const fieldsToUpdate = {
            first_name,
            last_name,
            phone,
            address,
            is_specialized,
            specialized_subjects,
            university,
            degree,
            degree_start_date,
            degree_end_date,
            cnic_number,
            degree_city,
            status,
            gender,
            profile_image,
        };

        // Update fields if provided
        Object.keys(fieldsToUpdate).forEach(field => {
            if (fieldsToUpdate[field] !== undefined) {
                existingTeacher[field] = fieldsToUpdate[field];
            }
        });

        // Save updated teacher
        const updatedTeacher = await existingTeacher.save();

        res.status(200).json({
            message: "Teacher updated successfully!",
            teacher: updatedTeacher,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTeacherStatus = async (req, res) => {
    const { teacher_id: teacherId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid Teacher ID" });
    }
    try {
        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        existingTeacher.status = status || existingTeacher.status;
        const updatedTeacher = await existingTeacher.save();

        res.status(200).json({
            message: "Teacher status updated successfully!",
            teacher: updatedTeacher
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
