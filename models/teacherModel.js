import mongoose from "mongoose";

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
                    return /\d{10}/.test(v);
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        address: {
            type: String,
            required: true,
        },
        date_of_birth: {
            type: Date,
            required: true,
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
        city: {
            type: String,
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

const Teacher = mongoose.model("teacher", teacherSchema);
export default Teacher;
