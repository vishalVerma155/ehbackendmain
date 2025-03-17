const mongoose = require("mongoose");

const marketingProgramSchema = new mongoose.Schema({
    programName: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    commissionType: {
        type: String,
        enum: ["percentage", "fixed"]
    },
    saleCommission: {
        type: Number,
        min: 0,
    },
    commissionForSale: {
        type: Number,
        required: true,
        min: 0,
    },
    saleStatus: {
        type: String,
        enum: ["enable", "disable"],
        default: "enable",
    },
    clicksAllow: {
        type: String,
        enum: ["allow multi clicks", "allow single click"]
    },
    numberOfClicks: {
        type: Number,
        default: 0,
        min: 0,
    },
    amountPerClick: {
        type: Number,
        default: 0,
        min: 0,
    },
    clickStatus: {
        type: String,
        enum: ["enable", "disable"],
        default: "disable",
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
