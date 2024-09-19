import Counter from "../models/counterModel.js";
import School from "../models/schoolModel.js";
import mongoose from "mongoose";

export const validateSchoolAndAdmin = async (req, res) => {
    const { school_id: schoolId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid school ID" });
    }

    try {
        // Check if the school exists and if the requesting user is the admin
        const school = await School.findById(schoolId).populate('school_admin');

        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }

        if (school.school_admin._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "This is not your school" });
        }

        return { school }; // Return the school object for further use
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while validating school" });
    }
};
export const getSequenceId = async (schoolId, type) => {
    const updateField = type === "student" ? "student_sequence" : "teacher_sequence";
    const counter = await Counter.findOneAndUpdate(
        { school_id: schoolId },
        { $inc: { [updateField]: 1 } },
        { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    return counter[updateField];
};
// utils/createRouter.js
export const customRouter = () => {
    return express.Router({ mergeParams: true });
};
