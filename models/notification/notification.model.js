const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    recipientAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    },
    senderAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
    },
    message: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    }
},{timestamps : true});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

