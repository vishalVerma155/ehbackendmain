const Campaign = require('../../../../../models/user/vendor/marketTools/campaigns/campain.model.js');
const User = require('../../../../../models/user/web/user.model.js');
const Program = require('../../../../../models/user/vendor/marketTools/programs/program.model.js')
const {encryprDecryptMethod} = require("../../../../../utils/crypto.js");

const createCampaign = async (req, res) => {

    try {

        const userId = req.user._id;
        const img = req.file?.path || undefined; // get image


        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }


        const { toolType, name, campaignTargetLink, linkTitle } = req.body;


        const isBlank = [toolType, name, campaignTargetLink, linkTitle].some((field) => field.trim() === "");


        if (isBlank) {
            return res.status(404).json({ success: false, error: "Tool type, Name, Campaign Target Link, Product Price, Link Title are compulsary" });
        }


        const data = req.body;

        const campaign = new Campaign({
            userId,
            image: img,
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
                select: "programName commissionType saleCommission commissionForSale status mlm image",
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

        if(req.user.role !== "admin"){
            return res.status(500).json({ success: false, error: "Only admin can do this" });
        }

        const { name, status, category, userId } = req.body;

        const filter = {};

        if (name && name.trim() !== "") {
            filter.name = { $regex: name, $options: "i" }; // case-insensitive search
        }

        if (status && status.trim() !== "") {
            filter.status = status;
        }

        if (category && category.trim() !== "") {
            const categoriesArray = category.split(",");
            filter.categories = { $in: categoriesArray };
        }

        if(userId && userId.trim() !== ""){
            filter.userId = userId;
        }

        const campaignsList = await Campaign.find(filter);
        return res.status(200).json({ success: true, campaignsList });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editCampaign = async (req, res) => {

    try {
        const campaignId = req.params.campaignId;
        const data = req.body;
        const img = req.file?.path || undefined; // get image

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

const urlEncode = async(req, res) =>{
    try {
        const affiliateId = req.user._id;
        
        const {productId, campaignTargetLink} = req.body;
        
        const payload = JSON.stringify({ affiliateId, productId, campaignTargetLink });
       
        const encrypted = encryprDecryptMethod(payload, 'encrypt');
       

        return res.status(200).json({success : true, url :  `http://localhost:4500/vendor/track?data=${encodeURIComponent(encrypted)}` });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });  
    }
}

const tracker = async(req, res) =>{
    
    console.log("Enter 1");
    const { data } = req.query;

    if (!data) return res.status(400).send("Invalid tracking link");

    try {
        const decrypted = encryprDecryptMethod(decodeURIComponent(data), 'decrypt');
        const { affiliateId, productId, campaignTargetLink } = JSON.parse(decrypted);

        // // Log the click
        // await ClickModel.create({
        //     affiliateId,
        //     productId,
        //     timestamp: new Date(),
        //     ip: req.ip,
        //     userAgent: req.headers['user-agent']
        // });

        console.log("Affiliate id : ", affiliateId, " , Product Id : ", productId, " , Link : ", campaignTargetLink);
        // Find product link
        // const product = await ProductModel.findById(productId);
        // if (!product || !product.url) {
        //     return res.status(404).send("Product not found");
        // }

        // Redirect
        return res.redirect(campaignTargetLink);

    } catch (err) {
        console.error("Tracking error:", err);
        return res.status(500).send("Something went wrong.");
    }
}

const getCampainListForVendor = async (req, res) => {
    try {

        const filter = {};
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        filter.userId = userId;

        const { name, status, category } = req.body;
        

        if (name && name.trim() !== "") {
            filter.name = { $regex: name, $options: "i" }; // case-insensitive search
        }

        if (status && status.trim() !== "") {
            filter.status = status;
        }

        if (category && category.trim() !== "") {
            const categoriesArray = category.split(",");
            filter.categories = { $in: categoriesArray };
        }

        const campaigns = await Campaign.find(filter);

        return res.status(200).json({ success: true, campaignList : campaigns });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const getCampainListForAffiliate = async (req, res) => {
    try {

        if(req.user.role !== "affiliate"){
            return res.status(400).json({success : false, error : "Only affiliate can get this"})
        }
        const filter = {};

        filter.status = "public";

        const { name, category } = req.body;
        

        if (name && name.trim() !== "") {
            filter.name = { $regex: name, $options: "i" }; // case-insensitive search
        }

        if (category && category.trim() !== "") {
            const categoriesArray = category.split(",");
            filter.categories = { $in: categoriesArray };
        }

        const campaigns = await Campaign.find(filter);

        return res.status(200).json({ success: true, campaignList : campaigns });

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

module.exports = { createCampaign, getAllCampaignsForAdmin, getCampainListForVendor, editCampaign, deleteCampaign, getCampaign, getCampainListForAffiliate, tracker, urlEncode };