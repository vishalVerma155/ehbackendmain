const Commission = require('../../models/commission/commission.model.js');
const User = require('../../models/user/web/user.model.js');
const Admin = require('../../models/admin/web/admin.model.js');
const axios = require('axios');
const mongoose = require('mongoose')

const createCommission = async (req, res) => {

    try {

        const { type, totalSaleAmount, commissionPercentage, integrationType, transactionId } = req.body;

        // console.log(req.body);

        const isBlank = [type, integrationType, transactionId].some((field) => field.trim() === "");


        if (isBlank) {
            return res.status(404).json({ success: false, error: " Type, Total Sale Amount, Commission Percentage, Integration Type, Transaction Id are compulsary" });
        }


        let { giverId, getterId, giverType } = req.body;

        let giver = undefined;
        let getter = undefined;
        let getterAdmin = undefined;
        let giverAdmin = undefined;


        if (giverType === "vendor") {

            giver = await User.findById(giverId);

            getterAdmin = await Admin.findById(getterId);

            if (!giver) {
                return res.status(404).json({ success: false, error: "Commission giver not found" });
            }

            if (!getterAdmin) {
                return res.status(404).json({ success: false, error: "Commission getter admin not found" });
            }
        }

        if (giverType === "admin") {
            giverAdmin = await Admin.findById(giverId);
            getter = await User.findById(getterId);

            if (!giverAdmin) {
                return res.status(404).json({ success: false, error: "Commission giver admin not found" });
            }

            if (!getter) {
                return res.status(404).json({ success: false, error: "Commission getter not found" });
            }
        }

        const commission = totalSaleAmount * (commissionPercentage / 100);

        const commissionReceipt = new Commission({
            getterId: getter ? getter : undefined,
            giverId: giver ? giver : undefined,
            giverAdmin: giverAdmin ? giverAdmin : undefined,
            getterAdmin: getterAdmin ? getterAdmin : undefined,
            type,
            totalSaleAmount,
            commission,
            commissionPercentage,
            integrationType,
            transactionId
        });

        await commissionReceipt.save();

        if (!commissionReceipt) {
            return res.status(500).json({ success: false, error: "error in creating commission receipt" });
        }

        let populatedCommissionReceipt = undefined;

        if (giverType === "vendor") {
            populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
                .populate("giverId", "firstName lastName email userId role")
                .populate("getterAdmin", "fullName email userId role")
                .lean(); // Convert Mongoose document to plain object for better performance

            const notification = await axios.post(
                "https://ehbackendmain.onrender.com/notification/createNotification",
                {
                    recipient: populatedCommissionReceipt.getterAdmin._id,
                    heading: `${populatedCommissionReceipt.giverId.firstName} ${populatedCommissionReceipt.giverId.lastName} ${populatedCommissionReceipt.giverId.role} has been generated a commission pay receipt.`,
                    message: `${populatedCommissionReceipt.giverId.firstName} ${populatedCommissionReceipt.giverId.lastName} ${populatedCommissionReceipt.giverId.role} has been generated a commission pay receipt of ${populatedCommissionReceipt.commission} rupess with commssion percentage ${populatedCommissionReceipt.commissionPercentage} on total sale of ${populatedCommissionReceipt.totalSaleAmount}`,
                    sender: populatedCommissionReceipt.giverId._id,
                    senderRole: populatedCommissionReceipt.giverId.role,
                    receiverRole: populatedCommissionReceipt.getterAdmin.role
                }
            );

        }

        if (giverType === "admin") {
            populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
                .populate("getterId", "firstName lastName email userId role")
                .populate("giverAdmin", "fullName email userId role")
                .lean(); // Convert Mongoose document to plain object for better performance


            const notification = await axios.post(
                "https://ehbackendmain.onrender.com/notification/createNotification",
                {
                    recipient: populatedCommissionReceipt.getterId._id,
                    heading: `${populatedCommissionReceipt.giverAdmin.role} has been generated a commission pay receipt.`,
                    message: `${populatedCommissionReceipt.giverAdmin.role} has been generated a commission pay receipt of ${populatedCommissionReceipt.commission} rupess with commssion percentage ${populatedCommissionReceipt.commissionPercentage} on total sale of ${populatedCommissionReceipt.totalSaleAmount}`,
                    sender: populatedCommissionReceipt.giverAdmin._id,
                    senderRole: populatedCommissionReceipt.giverAdmin.role,
                    receiverRole: populatedCommissionReceipt.getterId.role
                }
            );

        }

        return res.status(200).json({ success: true, populatedCommissionReceipt });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editCommission = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { paymentStatus, finalStatus } = req.body;
        const commId = req.params.commmissionId;

        if (!commId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Commission id not found" });
        }

        if (!paymentStatus && !finalStatus) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "At least one field (paymentStatus or finalStatus) is compulsory" });
        }

        const commission = await Commission.findById(commId).session(session);

        if (!commission) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Commission not found" });
        }

        if (commission.paymentStatus === "paid") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: "Commission is already paid." });
        }

        const payload = {};

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (finalStatus && finalStatus.trim() !== "") {
            payload.finalStatus = finalStatus;
        }

        const updatedCommission = await Commission.findByIdAndUpdate(
            commId,
            payload,
            { new: true, session }
        );

        if (!updatedCommission) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: "Commission receipt not found" });
        }

        let walletRes = undefined;

        if (updatedCommission.paymentStatus === "paid") {
            let apiPayload = {};

            if (updatedCommission.type === "commission pay to admin") {
                apiPayload = {
                    transactionId: updatedCommission.transactionId,
                    amount: updatedCommission.commission,
                    status: updatedCommission.paymentStatus,
                    commissionReceipt: updatedCommission._id,
                    giverId: updatedCommission.giverId,
                    getterId: updatedCommission.getterAdmin
                };
            }

            if (updatedCommission.type === "affiliate commission" || updatedCommission.type === "affiliate solo commission") {
                apiPayload = {
                    transactionId: updatedCommission.transactionId,
                    amount: updatedCommission.commission,
                    status: updatedCommission.paymentStatus,
                    commissionReceipt: updatedCommission._id,
                    giverId: updatedCommission.giverAdmin,
                    getterId: updatedCommission.getterId
                };
            }

            // Now calling axios AFTER internal operations
            try {
                const response = await axios.post("https://ehbackendmain.onrender.com/wallet/addDataToWallet", apiPayload);
                walletRes = response.data;
            } catch (axiosError) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).json({ success: false, error: "Wallet API call failed: " + axiosError.message });
            }
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, updated_commission: updatedCommission, walletRes });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, error: error.message });
    }
};


// const editCommission = async (req, res) => {
//     try {
//         const { paymentStatus, finalStatus } = req.body;
//         const commId = req.params.commmissionId;


//         if (!commId) {
//             return res.status(404).json({ success: false, error: "Commission id not found" });
//         }


//         if (!paymentStatus && !finalStatus) {
//             return res.status(404).json({ success: false, error: "One field is compulsary" });
//         }

//         const commission = await Commission.findById(commId);

//         if(commission.paymentStatus === "paid"){
//             return res.status(404).json({ success: false, error: "Commission is already paid." });
//         }



//         const payload = {};

//         if (paymentStatus && paymentStatus.trim() !== "") {
//             payload.paymentStatus = paymentStatus;
//         }


//         if (finalStatus && finalStatus.trim() !== "") {
//             payload.finalStatus = finalStatus;
//         }

//         const comm = await Commission.findByIdAndUpdate(commId, payload, { new: true });

//         if (!comm) {
//             return res.status(404).json({ success: false, error: "commission receipt not found" });
//         }

//         let walletRes = undefined;

//         if (comm.paymentStatus === "paid") {

//             if (comm.type === "commission pay to admin") {

//                 const response = await axios.post("https://ehbackendmain.onrender.com/wallet/addDataToWallet", {
//                     transactionId: comm.transactionId,
//                     amount: comm.commission,
//                     status: comm.paymentStatus,
//                     commissionReceipt: comm._id,
//                     giverId: comm.giverId,
//                     getterId: comm.getterAdmin
//                 })

//                 walletRes = response.data;

//             }

//             if (comm.type === "affiliate commission" || comm.type === "affiliate solo commission") {

//                 const response = await axios.post("https://ehbackendmain.onrender.com/wallet/addDataToWallet", {
//                     transactionId: comm.transactionId,
//                     amount: comm.commission,
//                     status: comm.paymentStatus,
//                     commissionReceipt: comm._id,
//                     giverId: comm.giverAdmin,
//                     getterId: comm.getterId
//                 })


//                 walletRes = response.data;

//             }
//         }

//         return res.status(200).json({ success: true, updated_commission: comm, walletRes });
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// }

const getCommissionGiverWise = async (req, res) => {
    try {
        const giverId = req.user._id;
        const role = req.user.role;
        const { startDate, endDate, paymentStatus } = req.body;


        if (!giverId) {
            return res.status(404).json({ success: false, error: "User is not loged in." });
        }

        const payload = {};

        if (startDate && endDate) {
            payload.createdAt = {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (role === "admin") {

            payload.giverAdmin = giverId;
            const giverCommission = await Commission.find(payload)
                .populate("getterId", "firstName lastName email userId role")
                .populate("giverAdmin", "fullName email userId role")
                .lean();


            return res.status(200).json({ success: true, given_Commission: giverCommission });
        }

        payload.giverId = giverId;
        const giverCommission = await Commission.find(payload)
            .populate("giverId", "firstName lastName email userId role")
            .populate("getterAdmin", "fullName email userId role")
            .lean();

        return res.status(200).json({ success: true, given_Commission: giverCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getCommissionGetterWise = async (req, res) => {
    try {
        const getterId = req.user._id;
        const role = req.user.role;
        const { startDate, endDate, paymentStatus } = req.body;

        if (!getterId) {
            return res.status(404).json({ success: false, error: "User is not loged in" });
        }

        const payload = {};

        if (startDate && endDate) {
            payload.createdAt = {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T23:59:59.999Z`)
            };
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }


        if (role === "admin") {
            payload.getterAdmin = getterId;
            const getterCommission = await Commission.find(payload)
                .populate("giverId", "firstName lastName email userId role")
                .populate("getterAdmin", "fullName email userId role")
                .lean();
            return res.status(200).json({ success: true, getter_Commission: getterCommission });
        }

        payload.getterId = getterId;
        const getterCommission = await Commission.find(payload)
            .populate("getterId", "firstName lastName email userId role")
            .populate("giverAdmin", "fullName email userId role")
            .lean();

        return res.status(200).json({ success: true, getter_Commission: getterCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getAllCommissionForAdmin = async (req, res) => {

    try {

        const allCommission = await Commission.find().sort({ paymentStatus: -1, createdAt: -1 });
        return res.status(200).json({ success: true, allCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const commissionFilterApi = async (req, res) => {

    try {
        const userId = req.user._id;
        const role = req.user.role;
        let { integrationType, paymentStatus, startDate, endDate } = req.body;

        const payload = {
        };

        if (role === "vendor") {
            payload.giverId = userId;
        }

        if (role === "affiliate") {
            payload.getterId = userId;
        }


        if (integrationType && integrationType.trim() !== "") {
            payload.integrationType = integrationType;
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (startDate) {
            startDate = new Date(`${startDate}T00:00:00.000Z`);
            endDate = new Date(`${endDate}T23:59:59.999Z`);


            if (isNaN(startDate) || isNaN(endDate)) {
                return res.status(400).json({ success: false, message: "Invalid date format" });
            }

            payload.date = { $gte: startDate, $lte: endDate }
        }

        const filteredResult = await Commission.find(payload);

        return res.status(200).json({ success: true, filteredResult });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { createCommission, getCommissionGetterWise, getCommissionGiverWise, getAllCommissionForAdmin, editCommission, commissionFilterApi };