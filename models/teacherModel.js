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
        specialized_subjects: {
            type: [String],
            default: [],
        },
        university: {
            type: String,
            required: true,
        },
        degree: {
            type: String,
            required: true,
        },
        degree_start_date: {
            type: Date,
            required: true,
        },
        degree_end_date: {
            type: Date,
            required: true,
        },
        degree_city: {
            type: String,
            required: true,
        },
        teacher_status: {
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
    },
    {
        timestamps: true,
    }
);
const Teacher = mongoose.model("teacher", teacherSchema);
export default Teacher;
