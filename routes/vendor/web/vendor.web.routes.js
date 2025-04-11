
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerVendor, registerVendorWithGoogle, editVendor, loginVendor, changeVendorPassword, getVendorProfile} = require('../../../controllers/user/vendor/web/vendor.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerVendor", registerVendor);

// affiliate register router with google
router.post("/registerVendorWithGoogle",registerVendorWithGoogle);

// login vendor
router.post("/loginVendor", loginVendor);

// edit vendor
router.patch("/editVendor",verifyJWT, editVendor);

// get vendor profile
router.get("/getVendor",verifyJWT, getVendorProfile);


// change password
router.patch("/changePassword", verifyJWT, changeVendorPassword);




module.exports = router;