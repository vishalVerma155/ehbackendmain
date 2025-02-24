const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {addGroup, getGroupInfo} = require('../../../controllers/admin/group/group.controllers.js');
const {upload} = require('../../../utils/multer.js')

const router = express.Router();

// add group
router.post("/addGroup", verifyJWT, upload.single("groupImage"), addGroup);

// get group information
router.get("/getGroupInfo", verifyJWT, getGroupInfo);







module.exports = router;

