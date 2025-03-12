const Wallet = require('../../models/wallet/wallet.model.js');

const createOrGetWallet = async (req, res) => {

    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const isWalletExisted = await Wallet.findOne({ userId });
        console.log(isWalletExisted);

        if (isWalletExisted) {
            return res.status(200).json({ success: true, wallet : isWalletExisted });
        }

        const wallet = new Wallet({
            userId,
            balance : 0,
            transactions : []
        });

        console.log("wallet has been saved")
        await wallet.save();

        if (!wallet) {
            return res.status(404).json({ success: false, error: "Wallet not created" });
        }

        return res.status(200).json({ success: true, wallet });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { createOrGetWallet };