const Group = require('../../../models/admin/group/group.model.js');
const Users = require('../../../models/user/web/user.model.js')

const addGroup = async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;
        const groupImage = req.file?.path || undefined;

        if (groupName.trim() === "") {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

        const group = new Group({
            groupName,
            groupDescription,
            groupImage
        })

        await group.save();

        if (!group) {
            return res.status(500).json({ success: false, error: "Something went wrong in saving group." });
        }

        return res.status(200).json({ success: true, group });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const getGroupInfo = async (req, res) => {

    try {
        const { groupName } = req.body;
        if (!groupName) {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

        const group = await Group.findOne({ groupName });

        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        const groupMemberCount = await Users.countDocuments({ groups: groupName });

        if (!groupMemberCount) {
            return res.status(404).json({ success: false, error: "No group member found" });
        }

        group.totalUsers = groupMemberCount;
        await group.save();

        return res.status(200).json({ success: true, group });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const addUserGroup = async (req, res) => {

    try {
        const userId = req.params.userId;
        const { groupName } = req.body;

        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.groups = groupName;
        await user.save();

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        if (!groupId) {
            return res.status(404).json({ success: false, error: "Group id not found." });
        }

        const deletedgroup = await Group.findByIdAndDelete(groupId);

        if (!deletedgroup) {
            return res.status(404).json({ success: false, error: "Group not found." });
        }

        return res.status(200).json({ success: true, deletedgroup });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const setDefaultGroup = () => { }

module.exports = { addGroup, getGroupInfo, deleteGroup };