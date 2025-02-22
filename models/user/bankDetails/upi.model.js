const mongoose = require('mongoose');

const upiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    upiId: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const UpiId = mongoose.model("UpiId", upiSchema);

module.exports = UpiId;