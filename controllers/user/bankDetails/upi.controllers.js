const UpiId = require('../../../models/user/bankDetails/upi.model.js');

const registerUpiId = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(404).json({ error: "User is not loged in." });
        }

        const { upiId } = req.body;

        if (upiId.trim() === "") {
            return res.status(404).json({ error: "All fields are compulsary" });
        }

        const upi = new UpiId({
            userId,
            upiId
        });

        await upi.save();

        if (!upi) {
            return res.status(500).json({ error: "Internal error in upi details" });
        }

        return res.status(200).json({ success: true, upi });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// get all registered upi ids of user
const getAllUpiId = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({ success: false, error: "User is not loged in." });
        }

        const upis = await UpiId.find({ userId });

        return res.status(200).json({ success: true, upiIds : upis });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// delete upi id of a user
const deleteUpiId = async (req, res) => {
    try {
        const upiId = req.params.upiId; // get bank account mongodb id

        if (!upiId) {
            return res.status(404).json({ success: false, error: "Upi id not found" });
        }

        const deletedUpiId = await UpiId.findByIdAndDelete(upiId);

        if (!deletedUpiId) {
            return res.status(404).json({ success: false, error: "Upi id not found. " });
        }

        return res.status(200).json({ success: true, deletedUpiId });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

};

// get single upi id
const getSingleUpiId = async (req, res) => {
    try {
        const upiId = req.params.upiId;

        if (!upiId) {
            return res.status(404).json({ success: false, error: "Upi id not found" });
        }

        const upi = await UpiId.findById(upiId);

        if (!upi) {
            return res.status(404).json({ success: false, error: "Upi id not found" });
        }
        return res.status(200).json({ success: true, upiId });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

module.exports = { registerUpiId, getAllUpiId, getSingleUpiId, deleteUpiId };