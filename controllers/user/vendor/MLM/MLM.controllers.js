const MLMCommission = require('../../../../models/user/vendor/MLM/mlmProgram.model.js');

const createMLM = async(req, res) =>{
    try {
        
        const userId = req.params.userId;

        if(!userId){
            return res.status(404).json({ success: false, error: "User id not found." });
        }

        const { totalCommission, commissionType} = req.body;

        if(!totalCommission || totalCommission < 0 || !commissionType || commissionType && commissionType.trim() === ""){
            return res.status(404).json({ success: false, error: "Commission and commission type is compulsary." });
        }

        const mlm = new MLMCommission({
            userId,
            totalCommission,
            commissionType
        })

        await mlm.save();

        if(!mlm){
            return res.status(500).json({ success: false, error: "MLM is not saved in database." });
        }

        return res.status(200).json({ success: true, MLM: mlm });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const editMLM = async(req, res) =>{
    try {
        const {totalMLMLevel, adminCommission, commissions} = req.body;
        const mlmId = req.params.mlmId;

        if(!mlmId){
            return res.status(404).json({ success: false, error: "MLM id is compulsary" });
        }

        if(!totalMLMLevel || totalMLMLevel && totalMLMLevel < 0 || !adminCommission || adminCommission && adminCommission < 0 || commissions.length <= 0){
            return res.status(404).json({ success: false, error: "All fields are compulsary type is compulsary." });
        }

        const mlm = await MLMCommission.findByIdAndUpdate(mlmId, {totalMLMLevel, adminCommission, commissions}, {new : true});

        if(!mlm){
            return res.status(404).json({ success: false, error: "MLM module not found" });
        }

        return res.status(200).json({ success: true, MLM: mlm, message : "MLM module has been update." });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {createMLM, editMLM};