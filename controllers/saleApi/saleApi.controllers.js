const axios = require('axios');

const createSale = async(req, res) =>{
    try {
        
        const {affiliateId, campaignId} = req.body;
        const affiliate = await axios.get("")
        return res.status(200).json({ success: true, message: "Sale has been done." });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {createSale};