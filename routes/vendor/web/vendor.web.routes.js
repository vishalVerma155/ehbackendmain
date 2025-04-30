
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerVendor, registerVendorWithGoogle,  editVendor, loginVendor, changeVendorPassword,authenticationApiVendor, getVendorProfile} = require('../../../controllers/user/vendor/web/vendor.web.controllers.js');
const {upload} = require('../../../utils/multer.js')



const router = express.Router();

// register affiliate with email and password
router.post("/registerVendor", registerVendor);

// affiliate register router with google
router.post("/registerVendorWithGoogle",registerVendorWithGoogle);

// login vendor
router.post("/loginVendor", loginVendor);

// edit vendor
router.patch("/editVendor",verifyJWT,upload.single('userImage'), editVendor);

// get vendor profile
router.get("/getVendor",verifyJWT, getVendorProfile);


// change password
router.patch("/changePassword", verifyJWT, changeVendorPassword);

// vendor authentication
router.get("/vendorAuthentication", verifyJWT, authenticationApiVendor)




module.exports = router;