import mongoose from "mongoose";
import School from "../models/schoolModel.js";
import SchoolClass from "../models/classModel.js";
import Section from "../models/sectionModel.js";


// creating default items for school 
const addSchoolDefaultItems = async (school) => {
    // Create three default sections (A, B, C)
    const sections = [{ name: 'A', color: "#fb7d5b" }, { name: 'B', color: "#4d44b5" }, { name: 'C', color: "#fcc43e" }];
    const sectionDocs = sections.map(section => ({
        section_name: section.name,
        color: section.color,
        school_id: school._id,
    }));
    const createdSections = await Section.insertMany(sectionDocs);  // Using insertMany for performance

    // Create ten default classes and assign them to Section A 
    const defaultClasses = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const classDocs = defaultClasses.map(className => ({
        class_name: className,
        is_default: true,  // These are default classes
        section: createdSections[0]._id,  // Initially assign to Section A
        school_id: school._id,
    }));
    await SchoolClass.insertMany(classDocs);  // Using insertMany for better performance
}



// Get all schools
export const getAllSchools = async (req, res) => {
    const { page = 1, school_name, sort_by } = req.query;
    let sortBy = {};
    let query = { school_admin: req.user.id };
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
            success: true,
            schools: schoolsList,
            total_items: totalSchools,
            per_page: schools_per_page,
            last_page_url,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Add new school
export const addNewSchool = async (req, res) => {
    const { school_name, school_address } = req.body;
    try {
        const existingSchool = await School.findOne({ school_name, school_admin: req.user.id });
        if (existingSchool) {
            return res.status(400).json({ success: false, message: "School already exists" });
        }
        const newSchool = new School({
            school_name,
            school_admin: req.user.id,
            school_address,
        });
        const savedSchool = await newSchool.save();
        await addSchoolDefaultItems(savedSchool)
        const schoolDetails = await savedSchool.populate('school_admin');
        res.status(201).json({
            success: true,
            message: "School added successfully!",
            school: schoolDetails,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// View school details
export const viewSchoolDetails = async (req, res) => {
    try {
        const school = req.school
        res.status(200).json({
            success: true,
            school: school
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while retrieving school details" });
    }
};

// Update school details
export const updateSchoolDetails = async (req, res) => {

    const { school_name, school_address, school_status } = req.body;

    try {
        const existingSchool = req.school
        existingSchool.school_name = school_name || existingSchool.school_name;
        existingSchool.school_address = school_address || existingSchool.school_address;
        existingSchool.school_status = school_status || existingSchool.school_status;

        const updatedSchool = await existingSchool.save();
        const updatedSchoolDetails = await updatedSchool.populate('school_admin');

        res.status(200).json({
            success: true,
            message: "School updated successfully!",
            school: updatedSchoolDetails,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update school status
export const updateSchoolStatus = async (req, res) => {
    const { school_status } = req.body;

    try {
        const existingSchool = req.school
        existingSchool.school_status = school_status || existingSchool.school_status;
        const updatedSchool = await existingSchool.save();
        const updatedSchoolDetails = await updatedSchool.populate('school_admin');

        res.status(200).json({
            success: true,
            message: "School status updated successfully!",
            school: updatedSchoolDetails
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
