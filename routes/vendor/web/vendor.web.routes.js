
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerVendor, registerVendorWithGoogle, editVendor} = require('../../../controllers/user/vendor/web/vendor.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerVendor", registerVendor);


// affiliate register router with google
router.post("/registerVendorWithGoogle",registerVendorWithGoogle);

// edit vendor
router.patch("/editVendor",verifyJWT, editVendor);








module.exports = router;