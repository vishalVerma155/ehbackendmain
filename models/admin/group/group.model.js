import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    groupDescription: {
        type: String,
        trim: true
    },
    groupImage: {
        type: String, // Store image URL (or use Buffer for file storage)
    },
    totalUsers: {
        type : Number,
        default : 0
    }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const Group = mongoose.model("Group", groupSchema);

export default Group;
