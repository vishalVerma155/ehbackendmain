const Group = require('../../../models/admin/group/group.model.js');
const Users = require('../../../models/user/web/user.model.js');
const Settings = require('../../../models/admin/settings/settings.model.js')

const addGroup = async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;
        const groupImage = req.file?.path || undefined;

        if (!groupName || groupName && groupName.trim() === "") {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

        const group = new Group({
            groupName,
            groupDescription : groupDescription ? groupDescription : "undefined",
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
        if (!groupName || groupName && groupName.trim() === "") {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

        const group = await Group.findOne({ groupName });

        if (!group) {
            return res.status(404).json({ success: false, error: "Group not found" });
        }

        const groupMemberCount = await Users.countDocuments({ groups: groupName });

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

        if (!groupName || groupName && groupName.trim() === "") {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

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

const setDefaultGroup = async (req, res) => {
    try {

        const { groupName } = req.body;

        if (!groupName || groupName && groupName.trim() === "") {
            return res.status(404).json({ success: false, error: "Group name is compulsary" });
        }

        const settings = await Settings.findOne();

        if (!settings) {
            const defGroup = new Settings({
                defaultGroup: groupName
            })
            await defGroup.save();

            if (!defGroup) {
                return res.status(500).json({ success: false, error: "Error in setting the default group" });
            }

            return res.status(200).json({ success: true, defGroup });
        }

        settings.defaultGroup = groupName;
        await settings.save();

        return res.status(200).json({ success: true, updatedDefaultGroup: settings });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}


const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        return res.status(200).json({ success: true, groups });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }

}

const editGroup = (req, res) =>{
    const groupId = req.params.groupId;
}

module.exports = { addGroup, getGroupInfo, deleteGroup, addUserGroup, setDefaultGroup, getAllGroups };