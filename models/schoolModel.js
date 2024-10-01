import mongoose from "mongoose";
import { fieldErrorsValidation } from "../middlewares/middlewares";

const schoolSchema = new mongoose.Schema(
    {
        school_name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        school_admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        school_address: {
            type: String,
            required: true,
            trim: true
        },
        total_students: {
            type: Number,
            default: 0
        },
        active_students: {
            type: Number,
            default: 0
        },
        graduated_students: {
            type: Number,
            default: 0
        },
        left_students: {
            type: Number,
            default: 0
        },
        suspended_students: {
            type: Number,
            default: 0
        },
        total_teachers: {
            type: Number,
            default: 0
        },
        active_teachers: {
            type: Number,
            default: 0
        },
        left_teachers: {
            type: Number,
            default: 0
        },
        suspended_teachers: {
            type: Number,
            default: 0
        },
        school_status: {
            type: String,
            enum: ['active', 'closed', 'inactive'],
            default: 'active'
        }
    },
    { timestamps: true }
);
schoolSchema.post('save', fieldErrorsValidation);

const School = mongoose.model("School", schoolSchema);
export default School;
