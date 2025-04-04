const Commission = require('../../models/commission/commission.model.js');
const User = require('../../models/user/web/user.model.js');
const Admin = require('../../models/admin/web/admin.model.js');
const axios = require('axios');

const createCommission = async (req, res) => {

    try {
        console.log("Enttetet 1");
        const { type, totalSaleAmount, commissionPercentage, integrationType, transactionId } = req.body;
        console.log("Enttetet 2", commissionPercentage);
        // console.log(req.body);

        const isBlank = [type, integrationType, transactionId].some((field) => field.trim() === "");
        console.log("Enttetet 3");

        if (isBlank) {
            return res.status(404).json({ success: false, error: " Type, Total Sale Amount, Commission Percentage, Integration Type, Transaction Id are compulsary" });
        }
        console.log("Enttetet 4");

        let { giverId, getterId, giverType } = req.body;

        let giver = undefined;
        let getter = undefined;
        let getterAdmin = undefined;
        let giverAdmin = undefined;
        console.log("Enttetet 5");

        if (giverType === "vendor") {
        console.log("Enttetet 6");

            giver = await User.findById(giverId);
        console.log("Enttetet 7");

            getterAdmin = await Admin.findById(getterId);
            console.log("Enttetet 8");

            if (!giver) {
        console.log("Enttetet 9");

                return res.status(404).json({ success: false, error: "Commission giver not found" });
            }

            if (!getterAdmin) {
        console.log("Enttetet 10");

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


        console.log("Enttetet 11");

        const commission = totalSaleAmount * (commissionPercentage / 100);
        console.log("Enttetet 12");

        console.log(req.body)
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
        console.log("Enttetet 13");

        await commissionReceipt.save();
        console.log("Enttetet 14");

        if (!commissionReceipt) {
            return res.status(500).json({ success: false, error: "error in creating commission receipt" });
        }
        console.log("Enttetet 15");


        let populatedCommissionReceipt = undefined;
        console.log("Enttetet 16");

        if (giverType === "vendor") {
        console.log("Enttetet 17");

            populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
                .populate("giverId", "firstName lastName email userId role")
                .populate("getterAdmin", "fullName email userId role")
                .lean(); // Convert Mongoose document to plain object for better performance
        console.log("Enttetet 18");

        }

        if (giverType === "admin") {
            populatedCommissionReceipt = await Commission.findById(commissionReceipt._id)
                .populate("getterId", "firstName lastName email userId role")
                .populate("giverAdmin", "fullName email userId role")
                .lean(); // Convert Mongoose document to plain object for better performance
        }

        console.log("Enttetet 19");

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

        const payload = {};

        if ( paymentStatus && paymentStatus.trim() !== "") {
            payload.paymentStatus = paymentStatus;
        }


        if ( finalStatus && finalStatus.trim() !== "") {
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
                    transactionId: "xyz",
                    amount: comm.commission,
                    status: comm.paymentStatus,
                    commissionReceipt: comm._id,
                    giverId: comm.giverId,
                    getterId: comm.getterAdmin
                })

                walletRes = response.data;

            }

            if (comm.type === "affiliate commission") {

                const response = await axios.post("http://localhost:4500/wallet/addDataToWallet", {
                    transactionId: "xyz",
                    amount: comm.commission,
                    status: comm.paymentStatus,
                    commissionReceipt: comm._id,
                    giverId: comm.giverAdmin,
                    getterId: comm.getterId
                })

                console.log("Entered in section")

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
        const giverId =  req.params.giverId;

        if (!giverId) {
            return res.status(404).json({ success: false, error: "Commission giver id not found" });
        }

        const giverCommission = await Commission.find({ giverId });

        return res.status(200).json({ success: true, given_Commission: giverCommission });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

const getCommissionGetterWise = async (req, res) => {
    try {
        const getterId =  req.params.getterId;

        if (!getterId) {
            return res.status(404).json({ success: false, error: "Commission getter Id not found" });
        }

        const getterCommission = await Commission.find({ getterId });

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
        let { integrationType, paymentStatus, startDate, endDate } = req.body;

        const payload = {};

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

        return res.status(200).json({ success: true, filteredResult: filteredResult.length > 0 ? filteredResult : "No result found" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { createCommission, getCommissionGetterWise, getCommissionGiverWise, getAllCommissionForAdmin, editCommission, commissionFilterApi };