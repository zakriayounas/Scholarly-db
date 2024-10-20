import mongoose from "mongoose";
import Section from "../models/sectionModel.js";

// Get all sections
export const getSchoolSections = async (req, res) => {
    const { school_id } = req.params
    try {
        const sections = await Section.find({ school_id })
        res.status(200).json({ sections });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a new section
export const addNewSection = async (req, res) => {
    try {
        // Destructure body data
        const { section_name, color, school_id } = req.body;

        // Create a new section with provided data
        const newSection = new Section({
            section_name,
            color,
            school_id
        });

        const savedSection = await newSection.save();
        res.status(201).json({
            message: "Section added successfully!",
            section: savedSection
        });
    } catch (error) {
        if (error.code === 11000) {
            // 11000 is the error code for duplicate key
            res.status(400).json({ message: "Section name already exists!" });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

// View section details
export const viewSectionDetails = async (req, res) => {
    const { section_id: sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "Invalid Section ID" });
    }

    try {
        const section = await Section.findById(sectionId).populate('school_id');

        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }

        res.status(200).json({ section });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving section details" });
    }
};

// Update section details
export const updateSectionDetails = async (req, res) => {
    const { section_id: sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "Invalid Section ID" });
    }

    const { section_name, color } = req.body;

    try {
        const existingSection = await Section.findById(sectionId);

        if (!existingSection) {
            return res.status(404).json({ message: "Section not found" });
        }

        // Update the fields if they are provided
        if (section_name) existingSection.section_name = section_name;
        if (color) existingSection.color = color;

        const updatedSection = await existingSection.save();

        res.status(200).json({
            message: "Section updated successfully!",
            section: updatedSection
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
