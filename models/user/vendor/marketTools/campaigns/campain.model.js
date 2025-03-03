const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    toolType: {
        type: String,
        required: true,
        enum: ["saleIntegration", "singleActionIntegration", "multiActionIntegration", "clickIntegration"],
        default: "saleIntegration",
        trim: true
    },
    userId: {
        type: String,
        trim: true
    },
    toolIntegrationPlugin: {
        type: String,
        trim: true
    },
    toolPeriod: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    campaignTargetLink: {
        type: String,
        required: true,
        trim: true
    },
    productPrice: {
        type: Number,
        required: true,
        min: 0
    },
    linkTitle: {
        type: String,
        required: true,
        trim: true
    },
    terms: {
        type: String,
        trim: true
    },
    categories: [
        {
            type: String,
            trim: true
        }
    ],
    vendorComment: {
        type: String,
        trim: true
    },
    image: {
        type: String, // URL or file path
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    allowForAffiliate: {
        type: String,
        enum: ["all", "selected"],
        default: "all"
    },
    selectedAffiliates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user" // Assuming the affiliate users are stored in the User collection
        }
    ],
    status: {
        type: String,
        enum: ["in review", "draft", "public"],
        default: "draft"
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketingProgram",
        required: true
    }
}, { timestamps: true });

const Campaign = mongoose.model("campaign", campaignSchema);

module.exports = Campaign;
