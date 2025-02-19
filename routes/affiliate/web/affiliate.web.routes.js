
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerAffiliateWithGoogle, generateAffiliateLink, registerAffiliate} = require('../../../controllers/user/affiliate/web/affiliate.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerAffiliate", registerAffiliate);


// affiliate register router with google
router.post("/registerAffiliateWithGoogle",registerAffiliateWithGoogle);

// generate affiliate link
router.post("/generateAffiliateLink", generateAffiliateLink);






module.exports = router;