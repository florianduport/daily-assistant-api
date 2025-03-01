import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    notes: {
        type: String,
        trim: true
    },
    completedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, { timestamps: true });

const Journal = mongoose.model('Journal', JournalSchema);

export default Journal;
