const MLMCommission = require('../../../../models/user/vendor/MLM/mlmProgram.model.js');

const createMLM = async(req, res) =>{
    try {
        
        const userId = req.params.userId;

        if(!userId){
            return res.status(404).json({ success: false, error: "User id not found." });
        }

        const {totalMLMLevel, totalCommission, adminCommission, commissionType, setForAll} = req.body;

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {createMLM};