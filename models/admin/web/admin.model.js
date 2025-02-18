const mongoose = require("mongoose");


const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name must be at most 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"]
    },
    phoneNumber: {
        type: String,
        match: [
            /^\+?[1-9]\d{9,14}$/,
            "Invalid phone number format. Please use E.164 format, e.g., +1234567890."
        ],
        default: undefined
    },
    userName: {
        type: String,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username must be at most 30 characters"]
    },
    password: {
        type: String
    }
}, { timestamps: true });


const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
