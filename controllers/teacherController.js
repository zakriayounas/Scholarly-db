import Teacher from '../models/teacherModel.js';
import { getRandomColor } from "../utils/helper.js";
import { getItemById, getSequenceId, handleFetchQuery } from './sharedController.js';

// handle teacher Count update
const handleTeacherCountUpdate = async (school, type, prevStatus, newStatus) => {
    if (type === "add") {
        school.total_teachers += 1;
        school.active_teachers += 1;
    } else if (type === "status_update") {
        if (prevStatus !== newStatus) {
            // Handle the case when moving out of "active"
            if (prevStatus === "active") {
                school.active_teachers -= 1;
            } else if (prevStatus === "suspended") {
                school.suspended_teachers -= 1;
            } else if (prevStatus === "left") {
                school.left_teachers -= 1;
            }

            // Handle the case when moving into "active"
            if (newStatus === "active") {
                school.active_teachers += 1;
            } else if (newStatus === "suspended") {
                school.suspended_teachers += 1;
            } else if (newStatus === "left") {
                school.left_teachers += 1;
            }
        }

    }
    await school.save();
};

// fetch teachers
export const getSchoolTeachers = async (req, res) => {
    const { query, sortBy, school, items_per_page, skip_items } = await handleFetchQuery(req);
    try {
        const totalTeachers = await Teacher.countDocuments(query);
        const lastPage = Math.ceil(totalTeachers / items_per_page);
        const last_page_url = `/schools/${school._id}/teachers?page=${lastPage}`;

        // Fetch teachers based on the query and pagination
        const teachersList = await Teacher.find(query)
            .select('first_name last_name profile_image profile_color phone email is_specialized')
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

//  add new teacher 
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
    await handleTeacherCountUpdate(school, "add")
    res.status(201).json({
        message: "Teacher added successfully!",
        teacher: savedTeacher
    });
};

//  view teacher details
export const viewTeacherDetails = async (req, res) => {
    const { teacher_id } = req.params;
    try {
        const teacher = await getItemById(teacher_id, "teacher")
        res.status(200).json({
            details: teacher,
        });
    } catch (error) {
        res.status(500).json({ message: `An error occurred: ${error.message}` }); // Include the error message in the response
    }
};

// update teacher details
export const updateTeacherDetails = async (req, res) => {
    const { teacher_id } = req.params;
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
        degree_city
    } = req.body;

    try {
        const existingTeacher = await getItemById(teacher_id, "teacher")
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

// update teacher status
export const updateTeacherStatus = async (req, res) => {
    const { teacher_id, status } = req.body;
    const school = req.school;

    try {
        const existingTeacher = await getItemById(teacher_id, "teacher")

        existingTeacher.status = status || existingTeacher.status;
        const updatedTeacher = await existingTeacher.save();
        await handleTeacherCountUpdate(school, "status_update", existingTeacher.status, status)

        res.status(200).json({
            message: "Teacher status updated successfully!",
            teacher: updatedTeacher
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
