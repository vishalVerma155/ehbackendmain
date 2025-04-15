
const express = require('express');
const verifyJWT = require('../../../../middleware/authMiddleware.js');
const {createCampaign, editCampaign, getAllCampaignsForAdmin, getCampaign, getCampainListForVendor, deleteCampaign} = require('../../../../controllers/user/vendor/marketTools/campaign/campaign.controllers.js');
const {upload} = require('../../../../utils/multer.js');



const router = express.Router();

// create campaign
router.post("/createCampaign", verifyJWT, upload.single('campaignImage'), createCampaign);

// edit marketing program
router.patch("/editCampaign/:campaignId", verifyJWT,upload.single('campaignImage'), editCampaign);

// get all programs
router.get("/getAllCampaignForAdmin", verifyJWT, getAllCampaignsForAdmin);

// get all program for vendor
router.post("/getAllCampaignForVendor", verifyJWT, getCampainListForVendor);

// get particular program
router.get("/getCampaign/:campaignId",verifyJWT, getCampaign);

// delete marketing program
router.delete("/deleteCampaign/:campaignId", verifyJWT, deleteCampaign);


module.exports = router;