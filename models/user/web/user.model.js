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
    userId: {
        type: String,
        required: [true, "User id is required"],
        unique: true
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
        sparse: true,
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
        trim: true,
        sparse: true,
        unique: true
    },
    groups: {
        type: String,
        default : "prime"
    },
    role: {
        type: String,
        trim: true,
        default: "affiliate",
        enum: ["affiliate", "vendor"]
    },
    password: {
        type: String
    },
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    referredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });


const User = mongoose.model("user", userSchema);
module.exports = User;
