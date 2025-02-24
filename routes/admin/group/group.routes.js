const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {addGroup} = require('../../../controllers/admin/group/group.controllers.js');
const {upload} = require('../../../utils/multer.js')

const router = express.Router();

// add group
router.post("/addGroup", verifyJWT, upload.single("groupImage"), addGroup);







module.exports = router;

