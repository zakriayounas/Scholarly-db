import mongoose from 'mongoose';
import Teacher from '../models/teacherModel.js';
import { getSequenceId, validateSchoolAndAdmin } from './sharedController.js';
import { getRandomColor } from "../utils/helper.js"
export const getAllTeachers = async (req, res) => {
    const { page = 1, first_name, sort_by, teacher_type } = req.query;
    // Call the validation function
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;

    try {
        // Initialize query and pagination variables
        const teachers_per_page = 15;
        const skipTeachers = teachers_per_page * (page - 1);
        let sortBy = {};
        let query = { school_id: school._id }; // Ensure school_id is part of the query

        // Apply filters based on query parameters
        if (first_name) {
            query.first_name = new RegExp(first_name, "i");
        }
        if (teacher_type === "specialized") {
            query.is_specialized = true;
        } else if (teacher_type === "general") {
            query.is_specialized = false;
        }
        if (sort_by) {
            if (sort_by === "newest") {
                sortBy.createdAt = -1;
            } else if (sort_by === "updatedAt") {
                sortBy.updatedAt = -1;
            } else if (sort_by === "alphabetically") {
                sortBy.first_name = 1;
            }
        }

        // Get total count of teachers
        const totalTeachers = await Teacher.countDocuments(query);
        const lastPage = Math.ceil(totalTeachers / teachers_per_page);
        const last_page_url = `/schools/${school._id}/teachers?page=${lastPage}`;

        // Fetch teachers based on the query and pagination
        const teachersList = await Teacher.find(query)
            .select('first_name last_name phone email specialized_subjects is_specialized profile_color')
            .limit(teachers_per_page)
            .skip(skipTeachers)
            .sort(sortBy);

        res.status(200).json({
            teachers: teachersList,
            per_page: teachers_per_page,
            total_items: totalTeachers,
            last_page_url,
            school: school,
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addNewTeacher = async (req, res) => {
    const { first_name, last_name, email, phone, cnic_number, address, gender, is_specialized, specialized_subjects, university, degree, degree_start_date, degree_end_date, degree_city, profile_image } = req.body;

    // Call the validation function
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
        return res.status(400).json({ message: "Teacher already exists" });
    }
    const sc_join_id = await getSequenceId(school._id, "teacher")
    const profile_color = getRandomColor();
    const teacher_status = "active";
    const newTeacher = new Teacher({
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
        degree_city,
        teacher_status,
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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;

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
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

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
        profile_image,
        teacher_status,
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
            teacher_status,
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
    const { teacher_id: teacherId, teacher_status } = req.body;
    const validationResult = await validateSchoolAndAdmin(req, res);
    if (validationResult === undefined) return; // If there's an error, exit early

    const { school } = validationResult;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: "Invalid Teacher ID" });
    }
    try {
        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        existingTeacher.teacher_status = teacher_status || existingTeacher.teacher_status;
        const updatedTeacher = await existingTeacher.save();

        res.status(200).json({
            message: "Teacher status updated successfully!",
            teacher: updatedTeacher
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
