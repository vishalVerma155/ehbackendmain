const SaleEvent = require("../../models/saleModel/saleEvent.model.js");
const User = require("../../models/user/web/user.model.js");
const Campaign = require('../../models/user/vendor/marketTools/campaigns/campain.model.js')
const mongoose = require('mongoose');


const createSaleEvent = async (req, res) => {
    try {
        const { vendorId, affiliateId, campaignId, saleAmount } = req.body;

        if (!vendorId || vendorId.trim() === "") {
            return res.status(400).json({ success: false, error: 'Invalid Vendor Id' });
        }
        if (!affiliateId || affiliateId.trim() === "") {
            return res.status(400).json({ success: false, error: 'Invalid Affiliate Id' });
        }
        if (!campaignId || campaignId.trim() === "") {
            return res.status(400).json({ success: false, error: 'Invalid Campaign Id' });
        }

        // Check if IDs exist
        const [vendor, affiliate, campaign] = await Promise.all([
            User.findById(vendorId),
            User.findById(affiliateId),
            Campaign.findById(campaignId),
        ]);

        if (!vendor) {
            return res.status(400).json({ success: false, error: 'Invalid vendorId' });
        }
        if (!affiliate) {
            return res.status(400).json({ success: false, error: 'Invalid affiliateId' });
        }
        if (!campaign) {
            return res.status(400).json({ success: false, error: 'Invalid productId' });
        }

        if (!campaign.userId.equals(vendor._id)) {
            return res.status(400).json({ success: false, error: 'Product does not belong to vendor' });
        }

        // Save the sale
        const sale = new SaleEvent({
            vendorId,
            affiliateId,
            campaignId,
            saleAmount
        });
        await sale.save();

        return res.status(201).json({ success: true, message: 'Sale recorded successfully' });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const totalSaleUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Build the base match filter
        let matchFilter = {
            [userRole === 'vendor' ? 'vendorId' : 'affiliateId']: new mongoose.Types.ObjectId(userId)
        };

        const {startDate, endDate} = req.body;

        // Add date filter if provided
        if (startDate || endDate) {
            matchFilter.timestamp = {};
            if (startDate) {
                matchFilter.timestamp.$gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            if (endDate) {
                matchFilter.timestamp.$lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }

        const totalSales = await SaleEvent.aggregate([
            { $match: matchFilter },
            { $group: {
                _id: '$campaignId',                      // group by campaignId
                total: { $sum: '$saleAmount' },
                count: { $sum: 1 }
            }},
            { $lookup: {                                 // join campaign details (if you want names)
                from: 'campaigns',
                localField: '_id',
                foreignField: '_id',
                as: 'campaign'
            }},
            { $unwind: { path: '$campaign', preserveNullAndEmptyArrays: true } },
            { $project: {
                campaignId: '$_id',
                campaignName: '$campaign.name',          // or any other campaign field you want
                totalSales: '$total',
                saleCount: '$count'
            }}
        ]);
        

        return res.status(200).json({ success: true, totalSaleOfUser: totalSales })

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


module.exports = { createSaleEvent, totalSaleUser };