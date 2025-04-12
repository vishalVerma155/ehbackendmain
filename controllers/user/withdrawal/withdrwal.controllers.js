const Withdrawal = require('../../../models/user/vendor/withdrawal/withdrawal.model.js');

const createWithdrawalRequest =async (req, res) =>{
    try {
        const currUser = req.user._id;
        const {amount, bankDetails, upi, comment} = req.body;

        if (!currUser) {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        if(amount <0 ){
            return res.status(404).json({ success: false, error: "Withdrwal amount should be greater then 0" });
        }

        if((!bankDetails || bankDetails && bankDetails.trim() === "") && (!upi || upi && upi.trim() === "")){
            return res.status(404).json({ success: false, error: "Please give us atleast one payment method" });
        }

        const withdrawalRequest = new Withdrawal({
            userId,
            amount,
            bankDetails : bankDetails ? bankDetails : undefined,
            upi : upi ? upi : undefined,
            comment
        });

        await withdrawalRequest.save();

        return res.status(200).json({ success: true, message : "Your withdrawal request has been submitted.", withdrawalRequest });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message }); 
    }
}


const getAllWithdrawalRequest =async (req, res) =>{
    try {
        
        if(req.user.role !== "admin"){
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }

        


        const {amount, bankDetails, upi, comment} = req.body;

        if (!currUser) {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        if(amount <0 ){
            return res.status(404).json({ success: false, error: "Withdrwal amount should be greater then 0" });
        }

        if((!bankDetails || bankDetails && bankDetails.trim() === "") && (!upi || upi && upi.trim() === "")){
            return res.status(404).json({ success: false, error: "Please give us atleast one payment method" });
        }

        const withdrawalRequest = new Withdrawal({
            userId,
            amount,
            bankDetails : bankDetails ? bankDetails : undefined,
            upi : upi ? upi : undefined,
            comment
        });

        await withdrawalRequest.save();

        return res.status(200).json({ success: true, message : "Your withdrawal request has been submitted.", withdrawalRequest });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message }); 
    }
}


module.exports = {createWithdrawalRequest};