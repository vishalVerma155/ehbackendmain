
const mongoose = require('mongoose');

const saleEventSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'campaign'
    },
    saleAmount:{
        type : Number
    },
    saleStatus : {
        type : String,
        enum : ["completed", "pending"],
        default : "pending"
    }
}, { timestamps: true });

const SaleEvent = mongoose.model("SaleEvent", saleEventSchema);

module.exports = SaleEvent;