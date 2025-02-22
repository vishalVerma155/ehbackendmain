const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    accountName: {
        type: String,
        required: true,
        trim: true
    },
    accountNumber: {
        type: String, // Stored as a string to preserve leading zeros
        required: true,
        unique: true
    },
    IFSCCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    bankAddress: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const BankDetail = mongoose.model("BankDetail", bankDetailSchema);

module.exports = BankDetail;
