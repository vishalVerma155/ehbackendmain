const mongoose = require("mongoose");

const affiliateClubSchema = new mongoose.Schema({
  clubName : {
    type : String
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
