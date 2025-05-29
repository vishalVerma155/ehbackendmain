
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {registerAffiliateWithGoogle, generateAffiliateLink, registerAffiliate,loginAffiliate, editAffiliate, getUserByUserId, getAffiliateProfile, changeAffiliatePaswword, getCurrUserAffTree, logouUser, authenticationApiAffiliate, forgotPassword, resetPassword } = require('../../../controllers/user/affiliate/web/affiliate.web.controllers.js');
const {upload} = require('../../../utils/multer.js')



const router = express.Router();

// register affiliate with email and password
router.post("/registerAffiliate", registerAffiliate);


// affiliate register router with google
router.post("/registerAffiliateWithGoogle",registerAffiliateWithGoogle);

// login affiliate
router.post("/loginAffiliate", loginAffiliate);

// generate affiliate link
router.get("/generateAffiliateLink",verifyJWT, generateAffiliateLink);

// edit affiliate
router.patch("/editAffiliate", verifyJWT, upload.single('userImage'), editAffiliate);

// get affiliate by affiliate id
router.get("/getAffiliate/:userId", verifyJWT, getUserByUserId);

// get affiliate profile
router.get("/getAffiliateProfile", verifyJWT, getAffiliateProfile)

// change current user password
router.patch("/changePassword", verifyJWT, changeAffiliatePaswword);

router.get("/getCurrUserAffTree", verifyJWT, getCurrUserAffTree);

// logout user
router.get("/logoutUser", verifyJWT, logouUser);

// authenticate affiliate
router.get("/affiliateAuthentication", verifyJWT, authenticationApiAffiliate);

router.post("/forgetPassword", forgotPassword);

router.patch("/resetPassword", resetPassword);








module.exports = router;