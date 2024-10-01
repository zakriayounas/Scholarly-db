import mongoose from "mongoose";
import { fieldErrorsValidation } from "../middlewares/middlewares.js";

const studentSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        last_name: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        b_form: {
            type: String,
            required: [true, 'B-form number is required'],
            validate: {
                validator: function (v) {
                    return /^\d{5}-\d{7}-\d{1}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid B-form number!`,
            },
            unique: true
        },
        date_of_birth: {
            type: Date,
            required: [true, 'Date of birth is required'],
        },
        class_name: {
            type: String,
            required: [true, 'Class name is required'],
        },
        student_status: {
            type: String,
            default: "active",
            enum: {
                values: ["active", "suspended", "left", "graduated"],
                message: '{VALUE} is not a valid student status!',
            },
        },
        gender: {
            type: String,
            required: [true, 'Gender is required'],
            enum: {
                values: ["Male", "Female", "Other"],
                message: '{VALUE} is not a valid gender!',
            },
        },
        student_age: {
            type: Number,
            required: [true, 'Student age is required'],
        },
        profile_image: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        parent_first_name: {
            type: String,
            required: [true, 'Parent first name is required'],
            trim: true,
        },
        parent_last_name: {
            type: String,
            required: [true, 'Parent last name is required'],
            trim: true,
        },
        cnic_number: {
            type: String,
            required: [true, 'CNIC number is required'],
            validate: {
                validator: function (v) {
                    return /^\d{5}-\d{7}-\d{1}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid CNIC number!`,
            },
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            validate: {
                validator: function (v) {
                    return /^\d{4}-\d{3}-\d{4}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        payment: {
            type: String,
            enum: {
                values: ["cash", "card"],
                default: "cash",
                message: '{VALUE} is not a valid payment method!',
            },
        },
        profile_color: {
            type: String,
            required: [true, 'Profile color is required'],
        },
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: [true, 'School ID is required'],
        },
        sc_enroll_id: {
            type: Number,
            required: [true, 'Enrollment ID is required'],
            unique: true
        },
    },
    {
        timestamps: true,
    }
);

// Error handling middleware
studentSchema.post('save', fieldErrorsValidation);

const Student = mongoose.model("student", studentSchema);
export default Student;
