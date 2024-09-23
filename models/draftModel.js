import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema({
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    data_type: {
        type: String,
        required: true,
        enum: ["teacher", "student", "event"]
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export const Draft = mongoose.model('Draft', DraftSchema);
