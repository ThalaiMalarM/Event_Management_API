const { ref } = require("joi");
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
    },
    
}, { timestamps: true },
);

module.exports = mongoose.model("Feedback", feedbackSchema);