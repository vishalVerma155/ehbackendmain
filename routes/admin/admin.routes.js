
const express = require('express');
// const verifyJWT = require('../../middleware/authMIddleware.js');
const {registerAdmin, loginAdmin, getAllUsersList, searchUser, editAdmin, getAffiliateTree} = require('../../controllers/admin/web/admin.web.controllers.js');
const verifyJWT = require('../../middleware/authMiddleware.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerAdmin", registerAdmin);

// login admin
router.post("/loginAdmin", loginAdmin);

// get users list
router.get("/getUsersList",verifyJWT, getAllUsersList);

// search user by email, name, 
router.get("/searchUser",verifyJWT, searchUser );

// edit admin details
router.patch("/editAdmin",verifyJWT, editAdmin);

// get affiliate tree
router.get("/affiliateTree/:userId", getAffiliateTree);





module.exports = router;