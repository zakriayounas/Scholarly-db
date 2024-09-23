import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        student_first_name: {
            type: String,
            required: true,
            trim: true,
        },
        student_last_name: {
            type: String,
            required: true,
            trim: true,
        },
        student_email: {
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
        student_phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /\d{10}/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        date_of_birth: {
            type: Date,
            required: true,
        },
        student_class: {
            type: String,
            required: true,
        },
        student_status: {
            type: String,
            required: true,
            default: "active",
            enum: ["active", "suspended", "left", "graduated"],
        },
        student_gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"],
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
        parent_phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /\d{10}/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        parent_email: {
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
            required: true,
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
