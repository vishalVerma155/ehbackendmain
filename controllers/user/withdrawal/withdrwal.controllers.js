const Withdrawal = require('../../../models/user/vendor/withdrawal/withdrawal.model.js');
const User = require("../../../models/user/web/user.model.js");
const BankDetail = require('../../../models/user/bankDetails/bankDetails.model.js');
const UpiId = require("../../../models/user/bankDetails/bankDetails.model.js");
const Wallet = require("../../../models/wallet/wallet.model.js");
const WalletTransaction = require("../../../models/wallet/walletTranstions.model.js");
const mongoose = require('mongoose');
const axios = require('axios');
const Admin = require('../../../models/admin/web/admin.model.js');


const createWithdrawalRequest = async (req, res) => {
    try {
        const currUser = req.user._id;
        const { amount, bankDetails, upi, comment } = req.body;

        if (!currUser) {
            return res.status(404).json({ success: false, error: "Vendor is not loged in" });
        }

        const currUserwallet = await Wallet.findOne({ userId: currUser });

        if (!currUserwallet) {
            return res.status(404).json({ success: false, error: "User wallet not found" });
        }

        if (amount > currUserwallet.balance) {
            return res.status(404).json({ success: false, error: `You can not withdrawal this amount because your wallet balance is :${currUserwallet.balance} ` });
        }

        if (amount < 0) {
            return res.status(404).json({ success: false, error: "Withdrwal amount should be greater then 0" });
        }

        if ((!bankDetails || bankDetails && bankDetails.trim() === "") && (!upi || upi && upi.trim() === "")) {
            return res.status(404).json({ success: false, error: "Please give us atleast one payment method" });
        }

        const withdrawalRequest = new Withdrawal({
            userId: currUser,
            amount,
            bankDetails: bankDetails ? bankDetails : undefined,
            upi: upi ? upi : undefined,
            comment
        });

        await withdrawalRequest.save();

        const withdraw = await Withdrawal.findById(withdrawalRequest._id).populate("userId", "firstName role");


        if (!withdraw) {
            return res.status(404).json({ success: false, error: "Withdrawal request not found." });
        }

        const admin = await Admin.findOne({ role: "admin" });

        const notification = await axios.post(
            "https://ehbackendmain.onrender.com/notification/createNotification",
            {
                recipient: admin._id,
                heading: `${withdraw.userId.firstName} ${withdraw.userId.role} has requested to withdrawal amount.`,
                message: `${withdraw.userId.firstName} ${withdraw.userId.role} has requested to withdrawal amount. of ${withdraw.amount} rupess from wallet`,
                sender: withdraw.userId._id,
                senderRole: withdraw.userId.role,
                receiverRole: admin.role
            }
        );

        return res.status(200).json({ success: true, message: "Your withdrawal request has been submitted.", withdrawalRequest });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}


const getAllWithdrawalRequest = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }

        const { startDate, endDate, status, paymentMethod } = req.body;

        const filter = {};

        // Filter by status
        if (status && status.trim() !== "") {
            filter.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            // console.log("hurr", filter)


            if (endDate) {
                filter.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }



        // Filter by payment method
        if (paymentMethod === 'bank') {
            filter.bankDetails = { $ne: null };
        } else if (paymentMethod === 'upi') {
            filter.upi = { $ne: null };
        }

        const withdrawalRequests = await Withdrawal.find(filter).sort({ paymentStatus: -1, createdAt: -1 })
            .populate("userId", "firstName userId email")
            .populate("bankDetails", "accountName accountNumber IFSCCode bankName")
            .populate("upi", "upiId");

        return res.status(200).json({ success: true, withdrawalRequests });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllWithdrawalRequestUser = async (req, res) => {
    try {

        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const { startDate, endDate, status, paymentMethod } = req.body;

        const filter = { userId };

        // Filter by status
        if (status && status.trim() !== "") {
            filter.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
            }

            if (endDate) {
                filter.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }

        // Filter by payment method
        if (paymentMethod === 'bank') {
            filter.bankDetails = { $ne: null };
        } else if (paymentMethod === 'upi') {
            filter.upi = { $ne: null };
        }

        const withdrawalRequests = await Withdrawal.find(filter).sort({ paymentStatus: -1, createdAt: -1 })
            .populate("userId", "firstName userId email")
            .populate("bankDetails", "accountName accountNumber IFSCCode bankName")
            .populate("upi", "upiId");

        return res.status(200).json({ success: true, withdrawalRequests });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editWithdrawalRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const role = req.user.role;

        if (role !== "admin") {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }

        const { withdrawalReqId, status, transactionId } = req.body;

        const withdReq = await Withdrawal.findById(withdrawalReqId).populate("userId", "role").session(session);

        if (!withdReq) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Withdrawal request not found" });
        }

        if (withdReq.status === "paid") {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Withdrawal request is already accepted." });
        }

        withdReq.status = status;
        await withdReq.save({ session });

        if (withdReq.status === "paid") {

            const wallet = await Wallet.findOne({ userId: withdReq.userId._id }).session(session);
            const amountWithdrawal = withdReq.amount;
            const paymentStatus = withdReq.status;

            const payload = {
                userId: withdReq.userId._id,
                transactionId,
                type: "withdrawal",
                amount: amountWithdrawal,
                drCr: "DR",
                status: paymentStatus,
                details: { withdrawalRequest: withdReq._id },
            };

            wallet.balance -= Number(amountWithdrawal);
            await wallet.save({ session });

            const walletTransaction = new WalletTransaction(payload);
            await walletTransaction.save({ session });

            await session.commitTransaction();
            session.endSession();

            const admin = await Admin.findOne({ role: "admin" })

            const notification = await axios.post(
                "https://ehbackendmain.onrender.com/notification/createNotification",
                {
                    recipient: withdReq.userId,
                    heading: `Your withdraw request has been approved.`,
                    message: `Your withdraw request has been accepted  amount of ${withdReq.amount} rupess from wallet`,
                    sender: admin._id,
                    senderRole: admin.role,
                    receiverRole: withdReq.userId.role
                }
            );

            return res.status(200).json({ success: true, walletTransaction, message: "Your withdrawal request has been completed. Amount has been deducted." });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, withdReq, message: "Withdrawal status is updated" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, error: error.message });
    }
};


// const editWithdrawalRequest = async (req, res) => {
//     try {
//         const role = req.user.role;

//         if (role !== "admin") {
//             return res.status(404).json({ success: false, error: "Only admin can do this" });
//         }

//         const { withdrawalReqId, status, transactionId } = req.body;

//         const withdReq = await Withdrawal.findById(withdrawalReqId);

//         if (!withdReq) {
//             return res.status(404).json({ success: false, error: "Withdrawal request not found" });
//         }

//         if(withdReq.status === "paid"){
//             return res.status(404).json({ success: false, error: "Withdrawal request is already accepted." });
//         }

//         withdReq.status = status;
//         await withdReq.save();

//         if (withdReq.status === "paid") {

//             const wallet = await Wallet.findOne({ userId : withdReq.userId });
//             const amountWithdrawal = withdReq.amount;
//             const paymentStatus = withdReq.status;

//             const payload = {
//                 transactionId: transactionId,
//                 type: "withdrawal",
//                 amount: amountWithdrawal,
//                 drCr: "DR",
//                 status: paymentStatus,
//                 details: { withdrawalRequest: withdReq._id },
//             }

//             wallet.balance -= Number(amountWithdrawal);
//             await wallet.save();

//             const walletTracnstion = new WalletTransaction(payload);
//             await walletTracnstion.save()

//             let populatedWithdrawalReceipt = await Withdrawal.findById(withdReq._id)
//                 .populate("userId", "firstName userId email")
//                 .populate("bankDetails", "accountName accountNumber IFSCCode bankName")
//                 .populate("upi", "upiId");

//             return res.status(200).json({ success: true, populatedWithdrawalReceipt, message: "Your withdrawal request has been completed. Amount has been added in your given payment method" });
//         }


//         return res.status(200).json({ success: true, withdReq, message: "Withdrawal status is not changed" })

//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// }


module.exports = { createWithdrawalRequest, getAllWithdrawalRequest, getAllWithdrawalRequestUser, editWithdrawalRequest };