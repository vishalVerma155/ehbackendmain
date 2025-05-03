const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    merchantOrderId: {
        type: String,
        required: true,
        unique: true
    },
    amount: Number,
    status: {
        type: String,
        default: 'PENDING'
    },
    phonepeResponse: Object
}, { timestamps: true });

const PaymentOrder = mongoose.model('paymentOrder', orderSchema);

module.exports = PaymentOrder;
