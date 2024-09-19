import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
        teacher_sequence: {
            type: Number,
            default: 0
        },
        student_sequence: {
            type: Number,
            default: 0
        },
    },
);
const Counter = mongoose.model("Counter", CounterSchema);

export default Counter;
