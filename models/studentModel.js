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
        date_of_birth: {
            type: Date,
            required: true,
        },
        student_age: {
            type: Number,
            required: true,
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
        student_class: {
            type: String,
            required: true,
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
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model("student", studentSchema);
export default Student;
