const Commission = require('../../models/commission/commission.model.js');
const User = require('../../models/user/web/user.model.js');
const Admin = require('../../models/admin/web/admin.model.js');
const axios = require('axios');

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
        }

        if (giverType === "admin") {
            populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
                .populate("getterId", "firstName lastName email userId role")
                .populate("giverAdmin", "fullName email userId role")
                .lean(); // Convert Mongoose document to plain object for better performance
        }

        return res.status(200).json({ success: true, populatedCommissionReceipt });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const editCommission = async (req, res) => {
    try {
        const { paymentStatus, finalStatus } = req.body;
        const commId = req.params.commmissionId;


        if (!commId) {
            return res.status(404).json({ success: false, error: "Commission id not found" });
        }

        
        if (!paymentStatus && !finalStatus) {
            return res.status(404).json({ success: false, error: "One field is compulsary" });
        }
        
        const commission = await Commission.findById(commId);

        if(commission.paymentStatus === "paid"){
            return res.status(404).json({ success: false, error: "Commission is already paid." });
        }



        const payload = {};

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }


        if (finalStatus && finalStatus.trim() !== "") {
            payload.finalStatus = finalStatus;
        }

        const comm = await Commission.findByIdAndUpdate(commId, payload, { new: true });

        if (!comm) {
            return res.status(404).json({ success: false, error: "commission receipt not found" });
        }

        let walletRes = undefined;

        if (comm.paymentStatus === "paid") {

            if (comm.type === "commission pay to admin") {

                const response = await axios.post("https://ehbackendmain.onrender.com/wallet/addDataToWallet", {
                    transactionId: comm.transactionId,
                    amount: comm.commission,
                    status: comm.paymentStatus,
                    commissionReceipt: comm._id,
                    giverId: comm.giverId,
                    getterId: comm.getterAdmin
                })

                walletRes = response.data;

            }

            if (comm.type === "affiliate commission" || comm.type === "affiliate solo commission") {

                const response = await axios.post("https://ehbackendmain.onrender.com/wallet/addDataToWallet", {
                    transactionId: comm.transactionId,
                    amount: comm.commission,
                    status: comm.paymentStatus,
                    commissionReceipt: comm._id,
                    giverId: comm.giverAdmin,
                    getterId: comm.getterId
                })


                walletRes = response.data;

            }
        }

        return res.status(200).json({ success: true, updated_commission: comm, walletRes });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

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
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }

        if (role === "admin") {

            payload.giverAdmin = giverId ;
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
                $gte: new Date(startDate),
                $lte: new Date(endDate)
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
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            endDate.setHours(23, 59, 59, 999);

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