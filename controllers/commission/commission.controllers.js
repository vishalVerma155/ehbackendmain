const Commission = require('../../models/commission/commission.model.js');
const User = require('../../models/user/web/user.model.js');

const createCommission = async(req, res) =>{

    try {
        const {giverId, getterId, type, totalSaleAmount, commissionPercentage, integrationType, transactionId} = req.body;

        const isBlank = [giverId, getterId, type, totalSaleAmount, commissionPercentage, integrationType, transactionId].some((field) => field.trim() === "");
    
        if(isBlank){
            return res.status(404).json({ success: false, error: "Giver Id, Getter Id, Type, Total Sale Amount, Commission Percentage, Integration Type, Transaction Id are compulsary" });
        }

        const giver = await User.findById(giverId);

        if(!giver){
            return res.status(404).json({ success: false, error: "Commission giver not found" });
        }

        
        const getter = await User.findById(getterId);

        if(!getter){
            return res.status(404).json({ success: false, error: "Commission getter not found" });
        }
    
        const commission= totalSaleAmount * (commissionPercentage / 100);
    
        const commissionReceipt = new Commission({
            getterId,
            giverId,
            type,
            totalSaleAmount,
            commission,
            commissionPercentage,
            integrationType,
            transactionId
        });
    
        await commissionReceipt.save();
    
        if(!commissionReceipt){
            return res.status(500).json({ success: false, error: "error in creating commission receipt" });
        }
    
        const populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
        .populate("giverId", "firstName lastName email userId role") 
        .populate("getterId", "firstName lastName email userId role") 
        .lean(); // Convert Mongoose document to plain object for better performance
    
        return res.status(200).json({ success: true, populatedCommissionReceipt });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {createCommission};