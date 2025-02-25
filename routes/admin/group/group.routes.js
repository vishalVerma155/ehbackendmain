const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {addGroup, getGroupInfo, deleteGroup, addUserGroup, setDefaultGroup, getAllGroups} = require('../../../controllers/admin/group/group.controllers.js');
const {upload} = require('../../../utils/multer.js')

const router = express.Router();

// add group
router.post("/addGroup", verifyJWT, upload.single("groupImage"), addGroup);

// get group information
router.get("/getGroupInfo", verifyJWT, getGroupInfo);

// add user's group
router.patch("/editUserGroup/:userId", verifyJWT, addUserGroup);

// delete group
router.delete("/deleteGroup/:groupId", verifyJWT, deleteGroup);

// make group default
router.post("/makeDefaultGroup", verifyJWT, setDefaultGroup);

// get all groups
router.get("/getAllGroups", verifyJWT, getAllGroups);






module.exports = router;

