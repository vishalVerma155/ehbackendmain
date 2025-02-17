
const express = require('express');
// const verifyJWT = require('../../middleware/authMIddleware.js');
const {registerAffiliateWithGoogle, generateAffiliateLink} = require('../../../controllers/user/web/user.web.controllers.js');



const router = express.Router();

// affiliate register router
router.post("/registerAffiliateWithGoogle",registerAffiliateWithGoogle);

// generate affiliate link
router.post("/generateAffiliateLink", generateAffiliateLink);

// // login affiliate
// router.post("/loginAffiliate", loginAffiliate);

// // get affiliate profile details
// router.get("/getAffiliateProfile",verifyJWT, getAffiliateProfile);

// // delete affiliate account
// router.delete("/deleteAffiliateAccount", verifyJWT, deleteAffiliateProfile);

// // change password of affiliate
// router.post("/changeAffiliatePassword", verifyJWT, changeAffiliatePaswword);

// // logout affiliate
// router.post("/logoutAffiliate", verifyJWT, logoutAffiliate);

// // all affiliate list
// router.get("/allAffiliateList", verifyJWT, allAffiliateList);






module.exports = router;