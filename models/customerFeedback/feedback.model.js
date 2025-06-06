const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    rating: {
        type: Number,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps : true});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
