const mongoose = require("mongoose");

const paymentDepositReceiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Reference to User model
      required: true,
    },
    amountDeposited: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "card", "net_banking"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["processed", "paid", "failed"],
      default: "processed",
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetail", // Reference to BankDetail model
    },
    upiDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UpiId", // Reference to upiId model
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const PaymentDepositReceipt = mongoose.model("PaymentDepositReceipt", paymentDepositReceiptSchema);
module.exports = PaymentDepositReceipt;
