
const express = require('express');
const verifyJWT = require('../../../../middleware/authMiddleware.js');
const {createCampaign, editCampaign, getAllCampaignsForAdmin, getCampaign, getCampainListForVendor,getCampainListForAffiliate, deleteCampaign, tracker, urlEncode} = require('../../../../controllers/user/vendor/marketTools/campaign/campaign.controllers.js');
const {upload} = require('../../../../utils/multer.js');
const {createCategory, getAllCategories, deleteCategory} = require('../../../../controllers/user/vendor/marketTools/campaign/category.controllers.js')




const router = express.Router();

// create campaign
router.post("/createCampaign", verifyJWT, upload.fields([
    { name: 'campaignImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), createCampaign);

// edit marketing program
router.patch("/editCampaign/:campaignId", verifyJWT, upload.fields([
    { name: 'campaignImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), editCampaign);

// get all programs
router.post("/getAllCampaignForAdmin", verifyJWT, getAllCampaignsForAdmin);

// get all program for vendor
router.post("/getAllCampaignForVendor", verifyJWT, getCampainListForVendor);

// get all campaigns for affiliates
router.post("/getAllCampaignsForAffiliate", verifyJWT, getCampainListForAffiliate);

// get particular program
router.get("/getCampaign/:campaignId",verifyJWT, getCampaign);

// delete marketing program
router.delete("/deleteCampaign/:campaignId", verifyJWT, deleteCampaign);

router.get("/track", tracker);

router.post("/madeEncodeLink",verifyJWT, urlEncode );

router.post("/createCategory", verifyJWT, createCategory);

router.get("/getAllCategories", verifyJWT, getAllCategories);

router.delete("/deletecategory/:categoryId", verifyJWT, deleteCategory)


module.exports = router;