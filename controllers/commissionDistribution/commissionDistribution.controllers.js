const Campaign = require("../../models/user/vendor/marketTools/campaigns/campain.model.js");
const User = require("../../models/user/web/user.model.js");
// const axios = require('axios');

const distributeCommision = async (req, res) => {

    try {

        const { sellerId, campaignId } = req.body;
        // let commissionAdmin = (22 / 100) * totalAmount; // 22% of total price
        // const levels = [4, 3, 2, 2, 1]; // Commission for each level
        console.log(campaignId);
        
        let distributedAmount = 0; // Track how much is given
        let level = 0;
        let userArr = [];

        let currentUser = await User.findOne({ _id: sellerId }).select("firstName userId referrer");

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
            .lean();

        const adminCommission = campaign.program.mlm.adminCommission;

        const mlmLevels = campaign.program.mlm.commissions;
        const productPrice = campaign.productPrice;
        const adminCom = [];
        adminCom.push({ amt: productPrice * adminCommission / 100, percentage : adminCommission });
        distributedAmount += productPrice * adminCommission / 100;


        distributedAmount += productPrice * (mlmLevels[level].commission / 100);
        userArr.push({ currentUser, amt: productPrice * (mlmLevels[level].commission / 100) });
        level++;


        while (currentUser && currentUser.referrer && level < mlmLevels.length) {
            let referrer = await User.findOne({ _id: currentUser.referrer }).select("firstName userId referrer");

            if (!referrer) break; // Stop if no referrer exists
            distributedAmount += productPrice * (mlmLevels[level].commission / 100);
            //    commissionAdmin -= productPrice * (levels[level] / 100);

            userArr.push({ referrer, amt: productPrice * (mlmLevels[level].commission / 100) });
            currentUser = referrer; // Move up the chain
            level++; // Increase level
        }

        console.log("level", level)
        console.log("mlm", mlmLevels.length)

        while(level < mlmLevels.length){
            adminCom.push({amt : productPrice * (mlmLevels[level].commission / 100),  percentage : mlmLevels[level].commission});
            distributedAmount += productPrice * (mlmLevels[level].commission / 100);
            level++;
        }

        // { Array: userArr, distributedAmount, commissionAdmin }
        return res.json({ adminCommission, mlmLevels, level, userArr, distributedAmount, adminCom, productPrice });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { distributeCommision }