const Notification = require('../../models/notification/notification.model.js');

// Create and send a notification
const createNotification = async (req, res) => {
    try {
        const { recipient, message, sender, senderRole } = req.body;


        if (!recipient || recipient && recipient.trim() === "" || !sender || sender && sender.trim() === "" || !senderRole || senderRole && senderRole.trim() === "") {
            return res.status(400).json({ success: false, error: "Receipt, sender, senderRole is compulsary" });
        }

        let notification = undefined;
        if (senderRole === "admin") {
            notification = new Notification({
                recipient,
                message,
                senderAdmin: sender
            });
            await notification.save();
            return res.status(201).json({ success: true, message: "Notification has been sent", notification });
        }

        notification = new Notification({
            sender,
            message,
            recipientAdmin: recipient
        });
        await notification.save();

        // Optionally: emit notification to recipient via Socket.IO (if online)
        // const io = req.app.get('io');
        // if (io && recipient) {
        //   io.to(recipient.toString()).emit('new_notification', notification);
        // }

        return res.status(201).json({ success: true, message: "Notification has been created", notification });

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

        const notifications = await Notification.find(filter)
            .sort({ seen: -1 });

        res.status(200).json({ success: true, message: "Notification has been fetched", notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Mark notification as seen
const markAsSeen = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const updated = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { seen: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

       return res.status(200).json({ success: true, message: "Notification has been seen" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark as seen' });
    }
};

// Mark all notifications as seen
const markAllAsSeen = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany({ recipient: userId, seen: false }, { seen: true });

        res.json({ message: 'All notifications marked as seen' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark notifications as seen' });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsSeen,
    markAllAsSeen,
};
