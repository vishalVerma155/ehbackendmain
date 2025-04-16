const SoloSale = require('../../../../models/user/soloSale/soloSale.model.js');

const createSoloSale = async(req, res) =>{
    try {

        const userId = req.user._id;
        const {commissionPercentage} = req.body;

        if(!userId){
         return res.status(404).json({success : false, error : "User is not loged in"})
        }

        if(!commissionPercentage || commissionPercentage <= 0){
         return res.status(404).json({success : false, error : "Please enter commission"})
        }

        const soloSaleCommission = await SoloSale({
         userId,
         commissionPercentage
        })

        await soloSaleCommission.save();

        return res.status(200).json({success : true, message : "Solo sale commission has been set for user.", soloSaleCommission});

     } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
     }
}