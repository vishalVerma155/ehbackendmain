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
    heading: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},{timestamps : true});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

