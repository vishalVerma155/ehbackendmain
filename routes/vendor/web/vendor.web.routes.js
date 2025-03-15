
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerVendor, registerVendorWithGoogle, editVendor, loginVendor, changeVendorPassword, deleteVendorProfile } = require('../../../controllers/user/vendor/web/vendor.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerVendor", registerVendor);


// affiliate register router with google
router.post("/registerVendorWithGoogle",registerVendorWithGoogle);

// login vendor
router.post("/loginVendor", loginVendor);

// edit vendor
router.patch("/editVendor",verifyJWT, editVendor);

// change password
router.patch("/changePassword", verifyJWT, changeVendorPassword);

// delete vendor profile 
router.delete("/deleteVendorProfile", verifyJWT, deleteVendorProfile);



module.exports = router;