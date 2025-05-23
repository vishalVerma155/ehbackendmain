const MarketingProgram = require('../../../../../models/user/vendor/marketTools/programs/program.model.js');
const MLMCommission = require('../../../../../models/user/vendor/MLM/mlmProgram.model.js');
const User = require('../../../../../models/user/web/user.model.js');
const Admin = require('../../../../../models/admin/web/admin.model.js') 

const createMarketingProgram = async (req, res) => {

    try {

        if (req.user.role !== "vendor" && req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "You are not authorized." });
        }

        const data = req.body;
        const { programName } = req.body;
        let userId = undefined;
        let adminId = undefined;

        if (req.user.role === 'vendor') {
            userId = req.user._id;
        }

        if (req.user.role === 'admin') {
            adminId = req.user._id;
        }

        if (!userId && !adminId) {
            return res.status(404).json({ success: false, error: "user id not found" });
        }

        if (!programName || !data) {
            return res.status(404).json({ success: false, error: "data not found" });
        }

        const makertingProgram = new MarketingProgram({
            userId,
            adminId,
            ...data
        });

        await makertingProgram.save();

        if (!makertingProgram) {
            return res.status(500).json({ success: false, error: "error in creating marketing program" });
        }

        const program = await MarketingProgram.findById(makertingProgram._id)
            .populate("mlm", "totalMLMLevel totalCommission adminCommission commissions")
            .lean();

        return res.status(200).json({ success: true, makertingProgram: program });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getMarketingProgram = async (req, res) => {

    try {
        const programId = req.params.programId;

        if (!programId) {
            return res.status(404).json({ success: false, error: "program id not found" });
        }

        const program = await MarketingProgram.findById(programId);

        if (!program) {
            return res.status(500).json({ success: false, error: "program not found" });
        }

        return res.status(200).json({ success: true, program });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getAllMarketingProgramForAdmin = async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(404).json({ success: false, error: "Only admin can do this" })
        }
        const { userId, programName, status } = req.body;

        const payload = {};

        if (userId && userId.trim() !== "") {
            payload.userId = userId;
        }


        if (programName && programName.trim() !== "") {
            payload.programName = programName;
        }

        if (status && status.trim() !== "") {
            payload.status = status;
        }

        const programs = await MarketingProgram.find(payload)
            .populate("userId", "firstName userId")
            .populate("adminId", "fullName role")
            .populate("mlm", "totalMLMLevel totalCommission adminCommission commissions")
            .lean();

        return res.status(200).json({ success: true, programs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getAllMarketingProgramForVendor = async (req, res) => {

    try {
        const userId = req.user._id;
        const { programName, status } = req.body;

        const payload = {};
        payload.userId = userId;

        if (programName && programName.trim() !== "") {
            payload.programName = programName;
        }

        if (status && status.trim() !== "") {
            payload.status = status;
        }


        const programs = await MarketingProgram.find(payload).lean();


        return res.status(200).json({ success: true, programs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const editMarketingProgram = async (req, res) => {

    try {
        const programId = req.params.programId;
        const data = req.body;


        if (!programId) {
            return res.status(404).json({ success: false, error: "program id not found" });
        }

        const updatedProgram = await MarketingProgram.findByIdAndUpdate(programId, data, { new: true });

        if (!updatedProgram) {
            return res.status(500).json({ success: false, error: "program not found" });
        }

        return res.status(200).json({ success: true, updatedProgram });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const deleteMarketingProgram = async (req, res) => {

    try {
        const programId = req.params.programId;

        if (!programId) {
            return res.status(404).json({ success: false, error: "program id not found" });
        }

        const deletedProgram = await MarketingProgram.findByIdAndDelete(programId);

        if (!deletedProgram) {
            return res.status(500).json({ success: false, error: "program not found" });
        }

        return res.status(200).json({ success: true, deletedProgram });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { createMarketingProgram, editMarketingProgram, getAllMarketingProgramForAdmin, getMarketingProgram, deleteMarketingProgram, getAllMarketingProgramForVendor }