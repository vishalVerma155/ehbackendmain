const mongoose = require("mongoose");

const affiliateClubSchema = new mongoose.Schema({
  clubName : {
    type : String,
    enum: ['spark', 'rise', 'impact', 'icon circle'],
    unique: true
  },
  commissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // assuming it's a percentage between 0 and 100
  },
  promotionThreshold: {
    type : Number
  }, // number of sales to get promoted
}, {
  timestamps: true, // adds createdAt and updatedAt
});

const AffiliateClub = mongoose.model("AffiliateClub", affiliateClubSchema);

module.exports = AffiliateClub;
