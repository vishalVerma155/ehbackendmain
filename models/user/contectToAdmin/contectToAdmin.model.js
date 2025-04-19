const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            trim: true
        },

        phoneNumber: {
            type: String,
            trim: true
        },

        domainName: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        body: {
            type: String,
            required: true
        },

        attachment: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ["Open", "Resolved"],
            default: "Resolved"
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    },

    { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);

module.exports = Query;
