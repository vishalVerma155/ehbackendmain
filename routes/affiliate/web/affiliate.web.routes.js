
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerAffiliateWithGoogle, generateAffiliateLink, registerAffiliate,loginAffiliate, editAffiliate, getUserByUserId, getAffiliateProfile, changeAffiliatePaswword, getCurrUserAffTree } = require('../../../controllers/user/affiliate/web/affiliate.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerAffiliate", registerAffiliate);


// affiliate register router with google
router.post("/registerAffiliateWithGoogle",registerAffiliateWithGoogle);

// login affiliate
router.post("/loginAffiliate", loginAffiliate);

// generate affiliate link
router.post("/generateAffiliateLink", generateAffiliateLink);

// edit affiliate
router.patch("/editAffiliate", verifyJWT, editAffiliate);

// get affiliate by affiliate id
router.get("/getAffiliate/:userId", verifyJWT, getUserByUserId);

// get affiliate profile
router.get("/getAffiliateProfile", verifyJWT, getAffiliateProfile)

// change current user password
router.patch("/changePassword", verifyJWT, changeAffiliatePaswword);

router.get("/getCurrUserAffTree", verifyJWT, getCurrUserAffTree);









module.exports = router;