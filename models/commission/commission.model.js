const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    giverId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',    
    },
    getterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    getterAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    },
    giverAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    },
    type: {
        type: String,
    },
    totalSaleAmount : {
        type: Number,
        min: 0
    },
    commission: {
        type: Number,
        required: true,
        min: 0
    },
    commissionPercentage: {
        type: Number,
    },
    integrationType: {
        type: String,
    },
    paymentStatus: {
        type: String,
        default: 'unpaid'
    },
    finalStatus: {
        type: String,
        default: 'pending'
    },
    transactionId : {
        type: String,
        required: 
        true
    }
}, { timestamps: true });

const Commission = mongoose.model('Commission', commissionSchema);
module.exports = Commission;
