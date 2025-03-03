
const express = require('express');
const verifyJWT = require('../../../../middleware/authMiddleware.js');
const {createCampaign} = require('../../../../controllers/user/vendor/marketTools/campaign/campaign.controllers.js');



const router = express.Router();

// create campaign
router.post("/createCampaign", verifyJWT, createCampaign);

// // edit marketing program
// router.patch("/editMarketingProgram/:programId", verifyJWT, editMarketingProgram);

// // get all programs
// router.get("/getAllMarketingProgramsForAdmin", verifyJWT, getAllMarketingProgramForAdmin);

// // get all program for vendor
// router.get("/getAllMarketingProgramsForVendor", verifyJWT, getAllMarketingProgramForVendor);

// // get particular program
// router.get("/getMarketingProgram/:programId",verifyJWT, getMarketingProgram);

// // delete marketing program
// router.delete("/deleteMarketingProgram/:programId", verifyJWT, deleteMarketingProgram);


module.exports = router;