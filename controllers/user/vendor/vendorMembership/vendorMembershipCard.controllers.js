// const VendorMembershipCard = require('../../../../models/user/vendor/vendorMembershipModel/vendorMembershipCard.model.js');
const VendorMembership = require('../../../../models/user/vendor/vendorMembershipModel/vendorMembership.model.js');
const Wallet = require('../../../../models/wallet/wallet.model.js');
const WalletTransaction = require('../../../../models/wallet/walletTranstions.model.js');
const User = require('../../../../models/user/web/user.model.js');
const crypto = require('crypto');
const mongoose = require('mongoose');



const purchaseMembership = async (req, res) => {
  const session = await mongoose.startSession();

  try {
  session.startTransaction();

    if (req.user.role !== 'vendor') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, error: "Only vendors can perform this action." });
    }
    
    const { membershipName } = req.body;
    
    const userId = req.user._id;
    
    if (!membershipName || membershipName.trim() === "") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: "Membership name is required." });
    }

    const [vendor, membership, wallet] = await Promise.all([
      User.findById(userId).session(session),
      VendorMembership.findOne({ heading: membershipName }).session(session),
      Wallet.findOne({ userId }).select('-transactions').session(session)
    ]);

    if (!vendor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: 'Invalid vendorId.' });
    }

    
    if (!membership) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Membership not found." });
    }

    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Vendor's wallet not found." });
    }

    if (wallet.balance < membership.price) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: "Insufficient funds." });
    }

    wallet.balance -= Number(membership.price);
    await wallet.save({ session });

    const walletTransaction = new WalletTransaction({
      userId,
      transactionId: crypto.randomBytes(12).toString('hex'),
      type: "membership_purchase",
      amount: Number(membership.price),
      drCr: "DR",
      status: "paid"
    });

    await walletTransaction.save({ session });

    vendor.membershipName = membershipName;
    vendor.membership = true;
    await vendor.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return res.status(200).json({ success: true, message: "You have successfully purchased membership." });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {purchaseMembership};