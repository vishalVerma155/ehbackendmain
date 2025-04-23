const AffiliateClub = require('../../../../models/user/soloSale/affiliateClub.model.js');
const User = require('../../../../models/user/web/user.model.js');

// Create a new club
const createClub = async (req, res) => {
   try {
      if (req.user.role !== "admin") {
         return res.status(400).json({ success: false, error: "Only admin can do this" })
      }
      const { clubName, commissionPercentage, promotionThreshold } = req.body;

      if (!clubName || !commissionPercentage || !promotionThreshold) {
         return res.status(400).json({ success: false, error: "All fields are required" })
      }

      const club = new AffiliateClub({
         clubName,
         commissionPercentage,
         promotionThreshold
      });
      await club.save();

      return res.status(201).json({ success: true, message: 'Club created', data: club });
   } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
   }
};

// Get all clubs
const getAllClubs = async (req, res) => {
   try {
      const clubs = await AffiliateClub.find();
      return res.status(200).json({ success: true, data: clubs });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
};

// Get single club by ID
const getClubById = async (req, res) => {
   try {
      const clubId = req.params.clubId;
      const club = await AffiliateClub.findById(clubId);
      if (!club) return res.status(404).json({ success: false, error: 'Club not found' });
      return res.status(200).json({ success: true, data: club });
   } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
   }
};

// Update a club
const updateClub = async (req, res) => {
   try {

      if (req.user.role !== "admin") {
         return res.status(400).json({ success: false, error: "Only admin can do this" })
      }

      const clubId = req.params.clubId;

      if (!clubId) {
         return res.status(400).json({ success: false, error: "Club id not found" })
      }

      const { clubName, commissionPercentage, promotionThreshold } = req.body;

      const payload = {};

      if (clubName && clubName.trim() !== "") {
         payload.clubName = clubName;
      }

      if (commissionPercentage && commissionPercentage > 0) {
         payload.commissionPercentage = commissionPercentage;
      }

      if (promotionThreshold && promotionThreshold > 0) {
         payload.promotionThreshold = promotionThreshold;
      }

      const updatedClub = await AffiliateClub.findByIdAndUpdate(
         clubId,
         payload,
         { new: true, runValidators: true }
      );
      if (!updatedClub) return res.status(404).json({ success: false, error: 'Club not found' });
      return res.status(200).json({ message: 'Club updated', data: updatedClub });
   } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
   }
};

// Delete a club
const deleteClub = async (req, res) => {
   try {
      if (req.user.role !== "admin") {
         return res.status(400).json({ success: false, error: "Only admin can do this" })
      }

      const clubId = req.params.clubId;

      if (!clubId) {
         return res.status(400).json({ success: false, error: "Club id not found" })
      }
      const deletedClub = await AffiliateClub.findByIdAndDelete(clubId);
      if (!deletedClub) return res.status(404).json({ success: false, error: 'Club not found' });
      return res.status(200).json({ success: true, message: 'Club deleted', deletedClub });
   } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
   }
};

const getAllClubMember = async (req, res) => {
   try {
      if (req.user.role !== "admin") {
         return res.status(400).json({ success: false, error: "Only admin can do this." });
      }

      const { clubName } = req.body;

      if (!clubName || clubName && clubName.trim() === "") {
         return res.status(400).json({ success: false, error: "Club name is required." });
      }

      const clubMember = await User.find({ clubName }).select("firstName userId role clubName email userName country");

      return res.status(200).json({ success: true, message: `${clubName} has been fetched.`, clubMember });

   } catch (error) {
      return res.status(400).json({ success: false, error: err.message });
   }
}

module.exports = { createClub, getAllClubs, getClubById, updateClub, deleteClub, getAllClubMember }