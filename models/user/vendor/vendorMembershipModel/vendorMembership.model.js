const mongoose = require('mongoose');
const { Schema } = mongoose;

const VendorMembershipSchema = new Schema({
  heading: {
    type: String,
    required: true,
  },
  subHeading: {
    type: String,
    
  },
  price: {
    type: String,
  },
  features: [
    {
      type: String,
    }
  ]
}, {timestamps : true});


const VendorMembershipModel = mongoose.model('VendorMembership', VendorMembershipSchema);
module.exports = VendorMembershipModel;
