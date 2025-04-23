const mongoose = require('mongoose');
const { Schema } = mongoose;

const membershipCardSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  selectedMembershipPlan: {
    heading: String,
    subHeading: String,
    price: String,
    features: [
      {
        featureHeading: String,
        isDone: {
          type: Boolean,
          default: false, // Initially not provided
        },
      }
    ],
  },
  paymentDone: {
    type: Boolean,
    default: false, // Defaults to false until payment is verified
  }
}, {timestamps : true});

const VendorMembershipCard = mongoose.model('VendorMembershipCard', membershipCardSchema);
module.exports = VendorMembershipCard;