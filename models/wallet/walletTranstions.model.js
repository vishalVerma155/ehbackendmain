const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["deposit", "commission_payment", "commission_received", "withdrawal", "soloSaleCommission", "membership_purchase"],
        required: true
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
        commissionReceipt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commission"
        },
        depositReceipt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentDepositReceipt"
        },
        withdrawalRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Withdrawal"
        }
    }
}, { timestamps: true });

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

module.exports = WalletTransaction;
