const VendorMembership = require('../../../../models/user/vendor/vendorMembershipModel/vendorMembership.model.js');

// Create Membership
const createMembership = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can create Membership Model" });
        }
        const { heading, subHeading, price, features } = req.body;

        if (!heading || heading && heading.trim() === "" || !price || price && price.trim() === "") {
            return res.status(400).json({ success: false, error: "Heading and price are compulsary" });
        }

        const membership = new VendorMembership({ heading, subHeading, price, features });
        await membership.save();

        res.status(201).json({ success: true,message : "Membership model has been created.", data: membership });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get All Memberships
const getAllMemberships = async (req, res) => {
    try {
        const memberships = await VendorMembership.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: memberships });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Single Membership by ID
const getMembershipById = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can create Membership Model" });
        }

        const modelId = req.params.modelId;

        if (!modelId) {
            return res.status(400).json({ success: false, error: "Model id not found" });
        }
        const membership = await VendorMembership.findById(modelId);

        if (!membership) {
            return res.status(404).json({ success: false, message: 'Membership not found' });
        }

        res.status(200).json({ success: true, data: membership });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Membership
const updateMembership = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can create Membership Model" });
        }

        const modelId = req.params.modelId;

        if (!modelId) {
            return res.status(400).json({ success: false, error: "Model id not found" });
        }

        const updated = await VendorMembership.findByIdAndUpdate(
            modelId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Membership not found' });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete Membership
const deleteMembership = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can create Membership Model" });
        }

        const modelId = req.params.modelId;

        if (!modelId) {
            return res.status(400).json({ success: false, error: "Model id not found" });
        }

        const deleted = await VendorMembership.findByIdAndDelete(modelId);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Membership not found' });
        }

        res.status(200).json({ success: true, message: 'Membership deleted', deleted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createMembership, getAllMemberships, getMembershipById, updateMembership, deleteMembership }