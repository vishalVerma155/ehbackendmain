const mongoose = require("mongoose");

const soloSaleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Assuming you have a User model
    required: true,
  },
  commissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // assuming it's a percentage between 0 and 100
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

const SoloSale = mongoose.model("SoloSale", soloSaleSchema);

module.exports = SoloSale;
