const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    toolType: {
        type: String,
        required: true,
        enum: ["saleIntegration", "singleActionIntegration", "multiActionIntegration", "clickIntegration"],
        default: "saleIntegration",
        trim: true
    },
    campaignType: {
        type: String,
        required: true,
        enum: ["bannerCampaign", "textCampaign", "linkCampaign", "videoCampaign"],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
    mrp: {
        type: Number,
        min: 0
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
    },
    content: {
        type: String,
        trim: true
    },
    textSize: { 
        type: String,
        trim: true
    },
    textColor: { 
        type: String,
        trim: true
    },
    backgroundColor: {
        type: String,
        trim: true
    },
    bannerImage: { 
        type: String,
        trim: true
    },
    campaignHeight: { 
        type: String,
        trim: true
    },
    campaignWidth: { 
        type: String,
        trim: true
    },
    videoLink: {
        type: String,
        trim: true
    },
    buttonText : {
        type : String,
        trim : true
    }
    
}, { timestamps: true });

const Campaign = mongoose.model("campaign", campaignSchema);

module.exports = Campaign;
