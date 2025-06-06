const Notification = require('../../models/notification/notification.model.js');
const { getIO } = require('../../socket/index.js');
const mongoose = require('mongoose')


// Create and send a notification
const createNotification = async (req, res) => {
    try {
        const { recipient, message, sender, senderRole, heading, receiverRole } = req.body;
        const io = getIO();

        if (!recipient || recipient && recipient.trim() === "" || !sender || sender && sender.trim() === "" || !senderRole || senderRole && senderRole.trim() === "" || !receiverRole || receiverRole && receiverRole.trim() === "") {
            return res.status(400).json({ success: false, error: "Receipt, sender, senderRole, receiverRole are compulsary" });
        }

        let notification = undefined;
        if (senderRole === "admin") {
            notification = new Notification({
                recipient,
                message,
                heading,
                senderAdmin: sender
            });
            await notification.save();

            io.to(`${receiverRole}:${recipient}`).emit("notification", {
                message: notification.heading,
            });
            return res.status(201).json({ success: true, message: "Notification has been sent" });
        }

        notification = new Notification({
            sender,
            message,
            heading,
            recipientAdmin: recipient
        });
        await notification.save();

        io.to(`${receiverRole}:${recipient}`).emit("notification", {
            message: notification.heading,
        });

        return res.status(201).json({ success: true, message: "Notification has been created"});

    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to create notification' });
    }
};

// Get all notifications for the logged-in user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const filter = {};
        if (req.user.role === 'admin') {
            filter.recipientAdmin = userId
        }

        if (req.user.role !== 'admin') {
            filter.recipient = userId
        }

        const notifications = await Notification.find(filter).select("message createdAt heading")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "Notification has been fetched", notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getNotificationById = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.user._id;

        // Role-based filter
        const filter = { _id: notificationId };

        if (req.user.role === 'admin') {
            filter.recipientAdmin = userId;
        } else {
            filter.recipient = userId;
        }

        const notification = await Notification.findOne(filter);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification fetched successfully', notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.user._id;

        if (!notificationId || !userId) {
            res.status(404).json({ success: false, error: "Notification and user id is required." });
        }

        const filter = {}

        filter._id = notificationId;

        if (req.user.role === "admin") {
            filter.recipientAdmin = userId;
        }

        if (req.user.role !== "admin") {
            filter.recipient = userId;
        }

        const deleted = await Notification.findOneAndDelete(filter);

        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Notification not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
};

const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "No IDs provided" });
    }

    const result = await Notification.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



module.exports = {
    createNotification,
    getUserNotifications,
    deleteNotification,
    getNotificationById,
    deleteNotifications
};
