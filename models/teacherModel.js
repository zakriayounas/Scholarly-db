import mongoose from "mongoose";
import { fieldErrorsValidation } from "../middlewares/middlewares.js";

const teacherSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            trim: true,
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\d{4}-\d{3}-\d{4}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        cnic_number: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\d{5}-\d{7}-\d{1}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid CNIC number!`,
            },
            unique: true
        },
        address: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"],
        },
        profile_image: {
            type: String,
            default: ""
        },
        is_specialized: {
            type: Boolean,
            default: false,
        },
        expertise: {
            type: [{
                type: String,
                required: false
            }],
            default: [], // This allows the array to be empty by default
        },
        about: {
            type: String,
            default: ""
        },
        education: [{
            _id: false, // Prevents the automatic creation of an _id field
            university: {
                type: String,
                required: true, // Ensures a university name is provided
            },
            degree: {
                type: String,
                required: true, // Ensures a degree title is provided (e.g., BSc, MSc, etc.)
            },
            degree_start_date: {
                type: Date,
                required: true, // Ensures the degree start date is provided
            },
            degree_end_date: {
                type: Date,
                required: true, // Ensures the degree end date is provided
                validate: {
                    validator: function (value) {
                        // Ensure end date is after start date
                        return value > this.degree_start_date;
                    },
                    message: 'End date must be after start date',
                }
            },
        }],
        status: {
            type: String,
            required: true,
            default: "active",
            enum: ["active", "suspended", "left"]
        },
        profile_color: {
            type: String,
            required: true,
        },
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true
        },
        sc_join_id: {
            type: Number,
            required: true,
            unique: true
        },
        school_role: {
            type: String,
            enum: ["admin", "teacher"],
            default: "teacher"
        },
        class_roles: [{
            class_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SchoolClass',
                required: true
            },
            role: {
                type: String,
                enum: ["admin", "class_teacher"],
                default: "class_teacher"
            }
        }],
    },
    {
        timestamps: true,
    }
);
const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
