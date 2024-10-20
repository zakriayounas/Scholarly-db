import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        class_name: {
            type: String,
            required: true,
            trim: true,
        },
        class_admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: ''
        },
        is_default: {
            type: Boolean,
            default: false,
        },
        has_multiple_sections: {
            type: Boolean,
            default: false,
        },
        section_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true,
        },
        class_capacity: {
            type: Number,
            default: 30,
            max: 50,
        },
        active_students_count: {
            type: Number,
            default: 0,
            validate: {
                validator: function (value) {
                    return value <= this.class_capacity;
                },
                message: "Active students count cannot exceed class capacity.",
            },
        },
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        }
    },
    {
        timestamps: true,
    }
);
classSchema.index({ class_name: 1, section_id: 1, school_id: 1 }, { unique: true });

const SchoolClass = mongoose.model("SchoolClass", classSchema);

export default SchoolClass;
