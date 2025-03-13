const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    transactions: [
        {
            transactionId: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ["deposit", "commission_payment", "commission_received"],
                required: true,
            },
            amount: {
                type: Number,
                required: true
            },
            drCr: {
                type: String,
                enum: ["DR", "CR"],
                required: true
            },
            status: {
                type: String,
                enum: ["processed", "paid", "failed"],
                default: "processed"
            },
            details: {
                bankDeposit: {
                    bankName: String,
                    accountNumber: String,
                    referenceId: String,
                    IFSC: String
                },
                commissionReceipt: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Commission",
                },
            },
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;