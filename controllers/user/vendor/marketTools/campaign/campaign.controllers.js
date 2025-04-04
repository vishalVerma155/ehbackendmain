const Campaign = require('../../../../../models/user/vendor/marketTools/campaigns/campain.model.js');
const User = require('../../../../../models/user/web/user.model.js');
const Program = require('../../../../../models/user/vendor/marketTools/programs/program.model.js')

const createCampaign = async (req, res) => {

    try {

        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const { toolType, name, campaignTargetLink, productPrice, linkTitle } = req.body;

        const isBlank = [toolType, name, campaignTargetLink, productPrice, linkTitle].some((field) => field.trim() === "");

        if (isBlank) {
            return res.status(404).json({ success: false, error: "Tool type, Name, Campaign Target Link, Product Price, Link Title are compulsary" });
        }

        const data = req.body;

        const campaign = new Campaign({
            userId,
            ...data
        });

        await campaign.save();

        if (!campaign) {
            return res.status(500).json({ success: false, error: "error in creating campaign" });
        }

        // Populate selectedAffiliates and program
        const populatedCampaign = await Campaign.findById(campaign._id)
            .populate("selectedAffiliates", "firstName lastName email userId")
            .populate({
                path: "program",
                select: "programName commissionType saleCommission commissionForSale status mlm",
                populate: {
                    path: "mlm", // Populating MLM inside the program
                    select: "totalMLMLevel totalCommission adminCommission commissions", // Selecting specific fields from MLM    
                },
            })
            .lean(); // Convert Mongoose document to plain object for better performance

        return res.status(200).json({ success: true, populatedCampaign });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getAllCampaignsForAdmin = async (req, res) => {
    try {
        const campaignsList = await Campaign.find();
        return res.status(200).json({ success: true, campaignsList });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editCampaign = async (req, res) => {

    try {
        const campaignId = req.params.campaignId;
        const data = req.body;


        if (!campaignId) {
            return res.status(404).json({ success: false, error: "campaign Id not found" });
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(campaignId, data, { new: true });

        if (!updatedCampaign) {
            return res.status(500).json({ success: false, error: "Campaign not found" });
        }

        return res.status(200).json({ success: true, updatedCampaign });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getCampainListForVendor = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const campaignList = await Campaign.find({ userId });
        return res.status(200).json({ success: true, campaignList });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getCampaign = async (req, res) => {

    try {
        const campaignId = req.params.campaignId;

        if (!campaignId) {
            return res.status(404).json({ success: false, error: "campaign Id not found" });
        }

        const campaign = await Campaign.findById(campaignId)
            .populate("selectedAffiliates", "firstName lastName email userId")
            .populate({
                path: "program",
                select: "programName commissionType saleCommission commissionForSale status mlm",
                populate: {
                    path: "mlm", // Populating MLM inside the program
                    select: "totalMLMLevel totalCommission adminCommission commissions", // Selecting specific fields from MLM    
                },
            })
            // .populate("program", "programName commissionType saleCommission commissionForSale status mlm")
            .lean();

        if (!campaign) {
            return res.status(500).json({ success: false, error: "campaign not found" });
        }

        return res.status(200).json({ success: true, campaign });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        const campaignId = req.params.campaignId;

        if (!campaignId) {
            return res.status(404).json({ success: false, error: "campaign Id not found" });
        }

        const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);

        if (!deleteCampaign) {
            return res.status(500).json({ success: false, error: "campaign not found" });
        }

        return res.status(200).json({ success: true, deletedCampaign });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { createCampaign, getAllCampaignsForAdmin, getCampainListForVendor, editCampaign, deleteCampaign, getCampaign };