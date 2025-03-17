const mongoose = require("mongoose");

const MLMSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, // User receiving commission
    totalMLMLevel: {
        type: Number,
    }, // MLM hierarchy level
    totalCommission: {
        type: Number,
        required: true,
        default: 0
    }, // Total earned commission
    adminCommission: {
        type: Number,
        required: true,
        default: 0
    }, // Admin's share
    commissionType: {
        type: String,
        enum: ["fixed", "percentage"],
        required: true
    }, // Type of commission
    setForAll : {
        type : Boolean,
        default : false 
    },
    commissions: [{
        level : {
            type : Number
        },
        commission : {
            type : Number
        }
    }]
}, {timestamps : true});

const MLMCommission = mongoose.model("MLMCommission", MLMSchema);

module.exports = MLMCommission;
