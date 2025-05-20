const mongoose = require("mongoose");

const marketingProgramSchema = new mongoose.Schema({
    programName: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Reference to user model
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin", // Reference to user model
    },
    commissionType: {
        type: String,
        enum: ["percentage", "fixed"]
    },
    clicksAllow: {
        type: String,
        enum: ["allow multi clicks", "allow single click"]
    },
    numberOfClicks: {
        type: Number,
        min: 0,
    },
    totalCommission: {
        type: Number,
        min: 0,
        required : true
    },
    amountPerClick: {
        type: Number,
        min: 0,
    },
    clickStatus: {
        type: String,
        enum: ["enable", "disable"],
    },
    vendorComment: {
        type: String
    },
    status: {
        type: String,
        enum: ["in review", "approved", "denied", "ask to edit"],
        default: "in review",
    },
    mlm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MLMCommission", // Reference to MLM model
    }
}, { timestamps: true });

const MarketingProgram = mongoose.model("MarketingProgram", marketingProgramSchema);

module.exports = MarketingProgram;
