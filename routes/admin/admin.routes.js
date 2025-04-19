
const express = require('express');
const {registerAdmin, loginAdmin, getAllUsersList, searchUser, changeAdminPassword, getAffiliateTree} = require('../../controllers/admin/web/admin.web.controllers.js');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {deleteVendorProfile, getAllVendors} = require('../../controllers/user/vendor/web/vendor.web.controllers.js');
const {deleteAffiliateProfile, getAllAffiliates} = require("../../controllers/user/affiliate/web/affiliate.web.controllers.js")



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





// get all vendors
router.get("/getAllVendors", verifyJWT, getAllVendors);

// delete vendor profile 
router.delete("/deleteVendorProfile/:userId", verifyJWT, deleteVendorProfile);







// get all affiliate
router.get("/getAllAffiliates", verifyJWT, getAllAffiliates);

// delete affiliate profile 
router.delete("/deleteAffiliateProfile/:userId", verifyJWT, deleteAffiliateProfile);


module.exports = router;