const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    defaultGroup: {
        type: String,
        required: true,
        default: "gold"
    }
});

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;
