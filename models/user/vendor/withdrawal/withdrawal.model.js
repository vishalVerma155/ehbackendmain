const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  bankDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankDetail",
  },
  upi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UpiId"
  },
  comment: {
    type: String,
  },
  status: {
    type: String,
    enum: ["processed", "paid"],
    default: "processed"
  },
}, {timestamps : true});

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

module.exports = Withdrawal;
