const PaymentDepositReceipt = require('../../../../models/user/vendor/deposit/depositReceipt.model.js');
const Wallet = require('../../../../models/wallet/wallet.model.js');
const BankDetail = require('../../../../models/user/bankDetails/bankDetails.model.js');
const UpiId = require('../../../../models/user/bankDetails/upi.model.js');

const createDepositReceipt = async (req, res) => {
    try {

        const userId = req.user._id;

        if (!userId || userId && userId.trim() === "") {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        const { amountDeposited, paymentMethod, paymentStatus, bankDetails, upiId, transactionId } = req.body;

        const isBlank = [paymentMethod, paymentStatus, transactionId].some((field) => field.trim() === "");

        if (isBlank) {
            return res.status(404).json({ success: false, error: "Payment Method, Payment Status, Transaction Id" });
        }

        if (amountDeposited && Number(amountDeposited) <= 0) {
            return res.status(400).json({ success: false, error: "Amount should be greater then 0" });
        }

        if (bankDetails && bankDetails.trim() === "" || upiId && upiId.trim() === "") {
            return res.status(400).json({ success: false, error: "Atleast one payment method is compulsary" });
        }

        const depositReceipt = new PaymentDepositReceipt({
            userId,
            amountDeposited,
            paymentMethod,
            paymentStatus,
            bankDetails: bankDetails ? bankDetails : undefined,
            upiDetails: upiId ? upiId : undefined,
            transactionId
        });

        await depositReceipt.save();


        if (!depositReceipt) {
            return res.status(500).json({ success: false, error: "error in creating commission receipt" });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ success: false, error: "Wallet not found." });
        }

        const payload = {
            transactionId: transactionId,
            type: "deposit",
            amount: amountDeposited,
            drCr: "CR",
            status: paymentStatus,
            details: { depositReceipt: depositReceipt._id },
            createdAt : new Date()
        }

        wallet.balance += Number(amountDeposited);
        wallet.transactions.push(payload);
        await wallet.save();

        let populatedDepositReceipt = undefined;

        if (paymentMethod === "upi") {
            populatedDepositReceipt = await PaymentDepositReceipt.findById(depositReceipt._id)
                .populate("userId", "firstName lastName email userId role")
                .populate("upiDetails", "upiId")
                .lean(); // Convert Mongoose document to plain object for better performance
        }

        if (paymentMethod === "bank_transfer") {
            populatedDepositReceipt = await PaymentDepositReceipt.findById(depositReceipt._id)
                .populate("userId", "firstName lastName email userId role")
                .populate("bankDetails", "accountName accountNumber bankName IFSCCode")
                .lean(); // Convert Mongoose document to plain object for better performance
        }

        return res.status(200).json({ success: true, populatedDepositReceipt });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllReceiptForAdmin = async(req, res) =>{
    try {
        const all_Receipts = await PaymentDepositReceipt.find();
        return res.status(200).json({ success: true, All_Deposit_Receipts : all_Receipts });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message }); 
    }
}

const getAllReceiptCurrentUser = async(req, res) =>{
    try {
        const currUser = req.user._id;

        if (!currUser || currUser && currUser.trim() === "") {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        const all_receipts = await PaymentDepositReceipt.find({userId : currUser});
        return res.status(200).json({ success: true, All_Deposit_Receipts : all_receipts });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message }); 
    }
}

const getDepositReceipt = async(req, res) =>{
    const transactionId = req.params.transactionId;
    
    if(!transactionId){
        return res.status(404).json({ success: false, error: "Transaction id not found." });
    }

    const receipt = await PaymentDepositReceipt.find({transactionId});

    if(!receipt){
        return res.status(404).json({ success: false, error: "Receipt not found" });
    }

    return res.status(200).json({ success: true, All_Deposit_Receipts : all_receipts });
}

module.exports = { createDepositReceipt, getAllReceiptCurrentUser, getAllReceiptForAdmin };