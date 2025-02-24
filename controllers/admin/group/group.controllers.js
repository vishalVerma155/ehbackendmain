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

module.exports = {addGroup};