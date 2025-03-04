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

const editCommission = async(req, res) =>{
    try {
        const {paymentStatus, finalStatus} = req.body;
        const commId = req.params.commmissionId;

        if(!commId){
            return res.status(404).json({ success: false, error: "Commission id not found" });
        }

        if(!paymentStatus && !finalStatus){
            return res.status(404).json({ success: false, error: "One field is compulsary" });
        }

        const payload = {};

        if(paymentStatus && paymentStatus.trim() !== ""){
            payload.paymentStatus = paymentStatus;
        }

        
        if(finalStatus && finalStatus.trim() !== ""){
            payload.finalStatus = finalStatus;
        }

        const comm = await Commission.findByIdAndUpdate(commId, payload, {new : true});

        if(!comm){
            return res.status(404).json({ success: false, error: "commission receipt not found" });
        }

        return res.status(200).json({ success: true, updated_commission : comm });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getCommissionGiverWise = async(req, res) =>{
    try {
        const giverId = await req.params.giverId;

        if(!giverId){
            return res.status(404).json({ success: false, error: "Commission giver id not found" });
        }

        const giverCommission = await Commission.find({giverId});

        return res.status(200).json({ success: true, given_Commission : giverCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getCommissionGetterWise = async(req, res) =>{
    try {
        const getterId = await req.params.getterId;

        if(!getterId){
            return res.status(404).json({ success: false, error: "Commission getter Id not found" });
        }

        const getterCommission = await Commission.find({getterId});

        return res.status(200).json({ success: true, getter_Commission : getterCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllCommissionForAdmin = async(req, res) =>{

    try {

        const allCommission = await Commission.find().sort({paymentStatus : -1});
        return res.status(200).json({ success: true,  allCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {createCommission, getCommissionGetterWise, getCommissionGiverWise, getAllCommissionForAdmin, editCommission};