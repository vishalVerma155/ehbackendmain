const BankDetail = require('../../../models/user/bankDetails/bankDetails.model.js');

const registerBankDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(404).json({ error: "User is not loged in." });
        }

        const { accountName, accountNumber, IFSCCode, bankName, bankAddress, city, state } = req.body;

        const isBlank = [accountName, accountNumber, IFSCCode, bankName, bankAddress, city, state].some(field => field.trim() === "");

        if (isBlank) {
            return res.status(404).json({ error: "All fields are compulsary" });
        }

        const bankDetails = new BankDetail({
            userId,
            accountName,
            accountNumber,
            IFSCCode,
            bankName,
            bankAddress,
            city,
            state
        });

        await bankDetails.save();

        if (!bankDetails) {
            return res.status(500).json({ error: "Internal error in saving bank details" });
        }

        return res.status(200).json({ success: true, bankDetails });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// get all registered accounts of user
const getAllAccounts = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in." });
        }

        const bankDetails = await BankDetail.find({ userId });

        return res.status(200).json({ success: true, bankDetails });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// delete bank details of a user
const deleteBankDetails = async (req, res) => {
    try {
        const bankDetailId = req.params.accountId; // get bank account mongodb id

        if (!bankDetailId) {
            return res.status(404).json({ success: false, error: "Bank account id not found" });
        }

        const deletedAccount = await BankDetail.findByIdAndDelete(bankDetailId);

        if (!deletedAccount) {
            return res.status(404).json({ success: false, error: "Bank account not found. " });
        }

        return res.status(200).json({ success: true, deletedAccount });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

};

// get single bank account
const getSinglebankAccount = async (req, res) => {
    try {
        const bankAccountId = req.params.accountId;

        if (!bankAccountId) {
            return res.status(404).json({ success: false, error: "Bank account id not found" });
        }

        const bankAccount = await BankDetail.findById(bankAccountId);

        if (!bankAccount) {
            return res.status(404).json({ success: false, error: "Bank account not found" });
        }
        return res.status(200).json({ success: true, bankAccount });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { registerBankDetails, getAllAccounts, deleteBankDetails, getSinglebankAccount };