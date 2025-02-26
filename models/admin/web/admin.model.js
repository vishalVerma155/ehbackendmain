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
    password: {
        type: String
    },
    role: {
        type: String,
        default : "admin"
    }
}, { timestamps: true });


const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
