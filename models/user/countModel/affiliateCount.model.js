const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["affiliate", "vendor"],
        required: true
    }, // Define whether it's an affiliate or vendor
    count: {
        type: Number,
        default: 0
    } // Keep track of the number of affiliates/vendors
});

// Pre-save hook to auto-increment count before saving a new entry
counterSchema.statics.increment = async function (type) {
    const counter = await this.findOneAndUpdate(
        { type },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );
    return counter.count;
};

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
