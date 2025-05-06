
const express = require('express');
const {registerAdmin, loginAdmin, getAllUsersList, searchUser, changeAdminPassword, getAffiliateTree,editAnyUser, deleteAnyUser, authenticationApiAdmin, affiliateTreeAdmin} = require('../../controllers/admin/web/admin.web.controllers.js');
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
router.patch("/changeAdminPassword", verifyJWT, changeAdminPassword);

// get affiliate tree
router.get("/affiliateTree/:userId", getAffiliateTree);

// delete any user
router.delete("/deleteAnyUser/:userId", verifyJWT, deleteAnyUser );

// edit any user
router.patch("/editAnyUser/:userId", verifyJWT, editAnyUser);

// authentication api
router.get("/adminAuthentication", verifyJWT, authenticationApiAdmin);

router.get("/getAllAffiliateTree", verifyJWT, affiliateTreeAdmin)


module.exports = router;