const VendorMembershipCard = require('../../../../models/user/vendor/vendorMembershipModel/vendorMembershipCard.model.js');

// CREATE Membership Card
const createMembershipCard = async (req, res) => {
  try {
    const { user, selectedMembershipPlan, paymentDone } = req.body;

    // Add isDone: false to each feature
    const enrichedFeatures = selectedMembershipPlan.features.map(f => ({
      featureHeading: f,
      isDone: false,
    }));

    const card = new VendorMembershipCard({
      user,
      selectedMembershipPlan: {
        heading: selectedMembershipPlan.heading,
        subHeading: selectedMembershipPlan.subHeading,
        price: selectedMembershipPlan.price,
        features: enrichedFeatures
      },
      paymentDone
    });

    await card.save();
    res.status(201).json({ success: true, data: card });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// READ All Membership Cards
const getAllMembershipCards = async (req, res) => {
  try {
    const cards = await VendorMembershipCard.find().populate('user');
    res.status(200).json({ success: true, data: cards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ Single Membership Card by ID
const getMembershipCardById = async (req, res) => {
  try {
    const card = await VendorMembershipCard.findById(req.params.id).populate('user');
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.status(200).json({ success: true, data: card });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE Membership Card (Features, Payment)
const updateMembershipCard = async (req, res) => {
  try {
    const card = await VendorMembershipCard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.status(200).json({ success: true, data: card });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE Membership Card
const deleteMembershipCard = async (req, res) => {
  try {
    const card = await VendorMembershipCard.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.status(200).json({ success: true, message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
