const Wallet = require('../../models/wallet/wallet.model.js');

const createOrGetWallet = async (req, res) => {

    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        const isWalletExisted = await Wallet.findOne({ userId });


        if (isWalletExisted) {
            return res.status(200).json({ success: true, wallet: isWalletExisted });
        }

        const wallet = new Wallet({
            userId,
            balance: 0,
            transactions: []
        });

        await wallet.save();

        if (!wallet) {
            return res.status(404).json({ success: false, error: "Wallet not created" });
        }

        return res.status(200).json({ success: true, wallet });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const addTranstionData = async (req, res) => {
    try {
        const { transactionId, amount, status, commissionReceipt, giverId, getterId } = req.body;

        const isBlank = [transactionId, amount, status, commissionReceipt].some((field) => field.trim() === "");

        if (isBlank) {
            return res.status(404).json({ success: false, error: "transactionId, type, amount, status, commission receipt are compulsary " });
        }

        const getterWallet = await Wallet.findOne({ userId: getterId });

        if (!getterWallet) {
            return res.status(404).json({ success: false, error: "Getter wallet not found" });
        }

        const giverWallet = await Wallet.findOne({ userId: giverId });

        if (!giverWallet) {
            return res.status(404).json({ success: false, error: "Giver wallet not found" });
        }

        const giverPayload = {
            transactionId,
            type: "commission_payment",
            amount,
            drCr: "DR",
            status: status,
            details: {
                bankDeposit: {
                    bankName: "pnb",
                    accountNumber: "123",
                    referenceId: "1234",
                    IFSC: "PUNB0094800"
                },
                commissionReceipt
            }
        }

        giverWallet.balance -= amount;
        giverWallet.transactions.push(giverPayload);
        await giverWallet.save();


        const getterPayload = {
            transactionId,
            type: "commission_received",
            amount,
            drCr: "CR",
            status: status,
            details: {
                bankDeposit: {
                    bankName: "pnb",
                    accountNumber: "123",
                    referenceId: "1234",
                    IFSC: "PUNB0094800"
                },
                commissionReceipt
            }
        }

        getterWallet.balance += amount;
        getterWallet.transactions.push(getterPayload);
        await getterWallet.save();

        return res.status(200).json({ success: true, message: "Commission has been updated in giver and getter walletes" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { createOrGetWallet, addTranstionData };