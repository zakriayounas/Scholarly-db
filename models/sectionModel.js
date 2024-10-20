import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    section_name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true
    },
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    }
}, {
    timestamps: true,
});

const Section = mongoose.model("Section", sectionSchema);

export default Section;
