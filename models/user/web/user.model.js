const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name must be at most 50 characters"]
    },
    lastName: {
        type: String,
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [50, "Last name must be at most 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"]
    },
    phoneNumber: {
        type: String,
        unique: true,
        match: [
            /^\+?[1-9]\d{9,14}$/,
            "Invalid phone number format. Please use E.164 format, e.g., +1234567890."
        ]
    },
    userName: {
        type: String,
        trim: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username must be at most 30 characters"]
    },
    storeName: {
        type: String,
        trim: true,
        minlength: [1, "Username must be at least 3 characters"],
        maxlength: [30, "Username must be at most 30 characters"]
    },
    country: {
        type: String,
        trim: true
    },
    googleId: {
        type: String,
        trim: true
    },
    groups: {
        type: Array
    },
    role: {
        type: String,
        trim: true,
        default: "affiliate",
        enum: ["affiliate", "vendor"]
    },
    password: {
        type: String,
        minlength: [8, "Password must be at least 6 characters"],
        match: [/^(?=[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/, "Password must be at least 8 characters, start with a capital letter, and contain at least one digit and one special character."]
    },
    affiliateId: {
        type: String,
        required: [true, "Affiliate id is required"]
    },
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Affiliate",
        default: null
    },
    referredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Affiliate"
        }
    ]
}, { timestamps: true });


const User = mongoose.model("user", userSchema);
module.exports = User;
