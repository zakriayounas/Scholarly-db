import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
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
        b_form: {
            type: String,
            required: true,
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
            required: true,
        },
        class_name: {
            type: String,
            required: true,
        },
        student_status: {
            type: String,
            default: "active",
            enum: ["active", "suspended", "left", "graduated"],
        },
        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"],
        },
        student_age: {
            type: Number,
            required: true,
        },
        profile_image: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            required: true,
        },
        parent_first_name: {
            type: String,
            required: true,
            trim: true,
        },
        parent_last_name: {
            type: String,
            required: true,
            trim: true,
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
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /\d{10}/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        email: {
            type: String,
            required: true,
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
            enum: ["cash", "card"],
            default: "cash"
        },
        profile_color: {
            type: String,
            required: true,
        },
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
        sc_enroll_id: {
            type: Number,
            required: true,
            unique: true
        },
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model("student", studentSchema);
export default Student;
