const PaymentDepositReceipt = require('../../../../models/user/vendor/deposit/depositReceipt.model.js');
const Wallet = require('../../../../models/wallet/wallet.model.js');
const BankDetail = require('../../../../models/user/bankDetails/bankDetails.model.js');
const UpiId = require('../../../../models/user/bankDetails/upi.model.js');
const WalletTransaction = require("../../../../models/wallet/walletTranstions.model.js");
const mongoose = require('mongoose');
const axios = require('axios');
const Admin = require('../../../../models/admin/web/admin.model.js');



const createDepositReceipt = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;

        if (!userId || (typeof userId === "string" && userId.trim() === "")) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Vendor is not logged in" });
        }

        const { amountDeposited, paymentMethod, paymentStatus, bankDetails, upiId, transactionId } = req.body;

        const isBlank = [paymentMethod, paymentStatus, transactionId].some((field) => field.trim() === "");

        if (isBlank) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "Payment Method, Payment Status, and Transaction Id are required" });
        }

        if (!amountDeposited || Number(amountDeposited) <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "Amount should be greater than 0" });
        }

        if ((!bankDetails || (typeof bankDetails === "string" && bankDetails.trim() === "")) &&
            (!upiId || (typeof upiId === "string" && upiId.trim() === ""))) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "At least one payment method is compulsory" });
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

        await depositReceipt.save({ session });

        if (!depositReceipt) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ success: false, error: "Error in creating deposit receipt" });
        }

        if (depositReceipt.paymentStatus === "failed") {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ success: true, depositReceipt, message: "Deposit failed." });
        }

        const wallet = await Wallet.findOne({ userId }).session(session);

        if (!wallet) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Wallet not found." });
        }

        wallet.balance += Number(amountDeposited);
        await wallet.save({ session });

        const walletTrans = new WalletTransaction({
            userId,
            transactionId: transactionId,
            type: "deposit",
            amount: amountDeposited,
            drCr: "CR",
            status: paymentStatus,
            details: { depositReceipt: depositReceipt._id }
        });
        await walletTrans.save({ session });

        await session.commitTransaction();
        session.endSession();

        let populatedDepositReceipt = await PaymentDepositReceipt.findById(depositReceipt._id)
            .populate("userId", "firstName lastName email userId role")
            .populate("upiDetails", "upiId")
            .populate("bankDetails", "accountName accountNumber bankName IFSCCode")
            .lean();

        const admin = await Admin.findOne({ role: 'admin' });

        const notification = await axios.post(
            "https://ehbackendmain.onrender.com/notification/createNotification",
            {
                recipient: admin._id,
                heading: `${populatedDepositReceipt.userId.firstName} ${populatedDepositReceipt.userId.lastName} ${populatedDepositReceipt.userId.role} has been deposited ${populatedDepositReceipt.
                    amountDeposited} in wallet`,
                message: `${populatedDepositReceipt.userId.firstName} ${populatedDepositReceipt.userId.lastName} ${populatedDepositReceipt.userId.role} has been deposited ${populatedDepositReceipt.
                    amountDeposited} in wallet through ${populatedDepositReceipt.bankDetails ? "Bank Account" : "UPI"}`,
                sender: populatedDepositReceipt.userId._id,
                senderRole: populatedDepositReceipt.userId.role,
                receiverRole: admin.role
            }
        );



        return res.status(200).json({
            success: true,
            populatedDepositReceipt,
            message: `${amountDeposited} has been deposited into your wallet.`
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, error: error.message });
    }
};


// const createDepositReceipt = async (req, res) => {
//     try {

//         const userId = req.user._id;

//         if (!userId || userId && userId.trim() === "") {
//             return res.status(404).json({ success: false, error: "Vendor is not loged in" });
//         }

//         const { amountDeposited, paymentMethod, paymentStatus, bankDetails, upiId, transactionId } = req.body;

//         const isBlank = [paymentMethod, paymentStatus, transactionId].some((field) => field.trim() === "");

//         if (isBlank) {
//             return res.status(404).json({ success: false, error: "Payment Method, Payment Status, Transaction Id" });
//         }

//         if (amountDeposited && Number(amountDeposited) <= 0) {
//             return res.status(400).json({ success: false, error: "Amount should be greater then 0" });
//         }

//         if ((!bankDetails || bankDetails && bankDetails.trim() === "") && (!upiId || upiId && upiId.trim() === "")) {
//             return res.status(400).json({ success: false, error: "Atleast one payment method is compulsary" });
//         }

//         const depositReceipt = new PaymentDepositReceipt({
//             userId,
//             amountDeposited,
//             paymentMethod,
//             paymentStatus,
//             bankDetails: bankDetails ? bankDetails : undefined,
//             upiDetails: upiId ? upiId : undefined,
//             transactionId
//         });

//         await depositReceipt.save();


//         if (!depositReceipt) {
//             return res.status(500).json({ success: false, error: "error in creating commission receipt" });
//         }

//         if (depositReceipt.paymentStatus === "failed") {
//             return res.status(500).json({ success: false, depositReceipt });
//         }

//         const wallet = await Wallet.findOne({ userId });

//         if (!wallet) {
//             return res.status(404).json({ success: false, error: "Wallet not found." });
//         }

//         wallet.balance += Number(amountDeposited);
//         await wallet.save();


//         const payload = {
//             userId,
//             transactionId: transactionId,
//             type: "deposit",
//             amount: amountDeposited,
//             drCr: "CR",
//             status: paymentStatus,
//             details: { depositReceipt: depositReceipt._id }
//         }

//         const walletTrans = new WalletTransaction(payload);
//         await walletTrans.save();


//         let populatedDepositReceipt = await PaymentDepositReceipt.findById(depositReceipt._id)
//             .populate("userId", "firstName lastName email userId role")
//             .populate("upiDetails", "upiId")
//             .populate("bankDetails", "accountName accountNumber bankName IFSCCode")
//             .lean();

//         return res.status(200).json({ success: true, populatedDepositReceipt, message : `${amountDeposited} has been deposited in your walllet.` });

//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// }

const getAllReceiptForAdmin = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "Only admin can do this." });
        }


        const { paymentMethod, paymentStatus, transactionId } = req.body;

        const payload = {};

        if (paymentMethod && paymentMethod.trim() !== "") {
            payload.paymentMethod = paymentMethod;
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (transactionId && transactionId.trim() !== "") {
            payload.transactionId = transactionId;
        }

        const all_Receipts = await PaymentDepositReceipt.find(payload)
            .populate("userId", "firstName userId role")
            .sort({ updatedAt: -1 })
            .lean();

        return res.status(200).json({ success: true, All_Deposit_Receipts: all_Receipts });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllReceiptCurrentUser = async (req, res) => {
    try {
        const currUser = req.user._id;

        if (!currUser || currUser && currUser.trim() === "") {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        const { paymentMethod, paymentStatus, transactionId } = req.body;

        const payload = {};

        payload.userId = currUser;

        if (paymentMethod && paymentMethod.trim() !== "") {
            payload.paymentMethod = paymentMethod;
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (transactionId && transactionId.trim() !== "") {
            payload.transactionId = transactionId;
        }

        const all_receipts = await PaymentDepositReceipt.find(payload)
            .populate("bankDetails", "accountName accountNumber bankName IFSCCode")
            .populate("upiDetails", "upiId")
            .sort({ updatedAt: -1 })
            .lean();
        return res.status(200).json({ success: true, All_Deposit_Receipts: all_receipts });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getDepositReceipt = async (req, res) => {
    const transactionId = req.params.transactionId;

    if (!transactionId) {
        return res.status(404).json({ success: false, error: "Transaction id not found." });
    }

    const receipt = await PaymentDepositReceipt.find({ transactionId });

    if (!receipt) {
        return res.status(404).json({ success: false, error: "Receipt not found" });
    }

    return res.status(200).json({ success: true, All_Deposit_Receipts: all_receipts });
}

module.exports = { createDepositReceipt, getAllReceiptCurrentUser, getAllReceiptForAdmin };