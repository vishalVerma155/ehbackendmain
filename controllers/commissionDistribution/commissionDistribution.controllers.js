const Campaign = require("../../models/user/vendor/marketTools/campaigns/campain.model.js");
const User = require("../../models/user/web/user.model.js");
const axios = require('axios');

const distributeCommision = async (req, res) => {

    try {

        const { sellerId, campaignId } = req.body;

        if (!sellerId || !campaignId) {
            return res.status(404).json({ success: false, error: "Seller or campaign id missing" });
        }


        let currentUser = await User.findOne({ _id: sellerId }).select("firstName userId referrer");

        if (!currentUser) {
            return res.status(404).json({ success: false, error: "Seller not found" });
        }


        const campaign = await Campaign.findById(campaignId)
            .populate("selectedAffiliates", "firstName lastName email userId")
            .populate({
                path: "program",
                select: "programName commissionType totalCommission status mlm",
                populate: {
                    path: "mlm", // Populating MLM inside the program
                    select: "totalMLMLevel totalCommission adminCommission commissions", // Selecting specific fields from MLM    
                },
            })
            .lean();


        if (!campaign) {
            return res.status(404).json({ success: false, error: "Campaign not found" });
        }



        let distributedAmount = 0; // Track how much is given
        let level = 0;



        const mlmLevels = campaign.program.mlm.commissions;
        const productPrice = campaign.productPrice;
        const adminCom = [];
        const commReceipt = [];
        const vendorId = campaign.userId;
        const adminCommission = campaign.program.totalCommission;


        const adminCommissionRec = await axios.post("http://localhost:4500/commission/createCommission", {
            giverId: vendorId,
            getterId: "67bebb666875b5a46440a659",
            type: "commission pay to admin",
            totalSaleAmount: productPrice,
            commissionPercentage: adminCommission,
            integrationType: "sale integration",
            transactionId: "122nbg3g2g2g4h4g2f",
            giverType: "vendor"
        },  {
            headers: { "Content-Type": "application/json" } // ✅ Added headers
        })


        if (adminCommissionRec.data.success !== true) {
            return res.status(400).json({ success: false, error: "Admin commission receipt not generated" })
        }
        commReceipt.push(adminCommissionRec.data);


        const currAffCommissionRec = await axios.post("http://localhost:4500/commission/createCommission", {
            giverId: "67bebb666875b5a46440a659",
            getterId: currentUser._id,
            type: "affiliate commission",
            totalSaleAmount: productPrice,
            commissionPercentage: mlmLevels[level].commission,
            integrationType: "sale integration",
            transactionId: "122nbg3g2g2g4h4g2f",
            giverType: "admin"
        },  {
            headers: { "Content-Type": "application/json" } // ✅ Added headers
        })


        commReceipt.push(currAffCommissionRec.data);

        distributedAmount += productPrice * (mlmLevels[level].commission / 100);
        level++;


        while (currentUser && currentUser.referrer && level < mlmLevels.length) {
            let referrer = await User.findOne({ _id: currentUser.referrer }).select("firstName userId referrer");

            if (!referrer) break; // Stop if no referrer exists


            const currAffCommissionRec = await axios.post("http://localhost:4500/commission/createCommission", {
                giverId: "67bebb666875b5a46440a659",
                getterId: referrer._id,
                type: "affiliate commission",
                totalSaleAmount: productPrice,
                commissionPercentage: mlmLevels[level].commission,
                integrationType: "sale integration",
                transactionId: "122nbg3g2g2g4h4g2f",
                giverType: "admin"
            })

            commReceipt.push(currAffCommissionRec.data);

            distributedAmount += productPrice * (mlmLevels[level].commission / 100);
            currentUser = referrer; // Move up the chain
            level++; // Increase level
        }

        console.log("Enter 13");

        return res.json({commReceipt, adminCommission, mlmLevels, level, distributedAmount });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}



module.exports = { distributeCommision }