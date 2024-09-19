import School from "../models/schoolModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
export const getAllSchools = async (req, res) => {
    const { page = 1, school_name, sort_by } = req.query;
    let sortBy = {};
    let query = {};
    const schoolAdmin = await User.findById(req.user.id);
    if (!schoolAdmin) {
        return res.status(400).json({ message: "User not found" });
    } else {
        query.school_admin = schoolAdmin._id;
    }
    const schools_per_page = 15;
    const skipSchools = schools_per_page * (page - 1);


    if (school_name) {
        query.school_name = new RegExp(school_name, "i");
    }
    if (sort_by) {
        if (sort_by === "newest") {
            sortBy.createdAt = -1;
        } else if (sort_by === "updatedAt") {
            sortBy.updatedAt = -1;
        } else if (sort_by === "alphabetically") {
            sortBy.school_name = 1;
        }
    }

    try {
        const totalSchools = await School.countDocuments(query);
        const lastPage = Math.ceil(totalSchools / schools_per_page);
        const last_page_url = `/schools?page=${lastPage}`;

        const schoolsList = await School.find(query)
            .limit(schools_per_page)
            .skip(skipSchools)
            .sort(sortBy);

        res.status(200).json({
            schools: schoolsList,
            total_items: totalSchools,
            per_page: schools_per_page,
            last_page_url,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addNewSchool = async (req, res) => {
    const { school_name, school_address } = req.body;
    try {
        const schoolAdmin = await User.findById(req.user.id);
        const existingSchool = await School.findOne({ school_name });
        if (existingSchool) {
            return res.status(400).json({ message: "School already exists" });
        }
        const school_status = "active";
        const newSchool = new School({
            school_name,
            school_admin: schoolAdmin._id,
            school_address,
            school_status,
        });
        const savedSchool = await newSchool.save();
        const schoolDetails = await savedSchool.populate('school_admin');
        res.status(201).json({
            message: "School added successfully!",
            school: schoolDetails,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const viewSchoolDetails = async (req, res) => {
    const { id: schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }

    try {
        const school = await School.findById(schoolId).populate('school_admin');

        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }
        if (school.school_admin._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "This is not your school" });
        }

        res.status(200).json({
            school: school
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving school details" });
    }
};

export const updateSchoolDetails = async (req, res) => {
    const { id: schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }
    const { school_name, school_address, school_status } = req.body;

    try {
        const existingSchool = await School.findById(schoolId);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }
        if (existingSchool.school_admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "This is not your school" });
        }

        existingSchool.school_name = school_name || existingSchool.school_name;
        existingSchool.school_address = school_address || existingSchool.school_address;
        existingSchool.school_status = school_status || existingSchool.school_status;

        const updatedSchool = await existingSchool.save();

        // Populate the school_admin field 
        const updatedSchoolDetails = await updatedSchool.populate('school_admin');

        res.status(201).json({
            message: "School updated successfully!",
            school: updatedSchoolDetails,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSchoolStatus = async (req, res) => {
    const { school_id: schoolId, school_status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }
    try {
        const existingSchool = await School.findById(schoolId);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }
        existingSchool.school_status = school_status || existingSchool.school_status;
        const updatedSchool = await existingSchool.save();
        const updatedSchoolDetails = await updatedSchool.populate('school_admin');

        res.status(200).json({
            message: "School status updated successfully!",
            school: updatedSchoolDetails
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
