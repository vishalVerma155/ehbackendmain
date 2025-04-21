
const express = require('express');
const verifyJWT = require('../../../../middleware/authMiddleware.js');
const {createMarketingProgram, getAllMarketingProgramForAdmin, getMarketingProgram, editMarketingProgram, deleteMarketingProgram, getAllMarketingProgramForVendor} = require('../../../../controllers/user/vendor/marketTools/program/program.controllers.js');



const router = express.Router();

// create marketing program
router.post("/createMarketingProgram", verifyJWT, createMarketingProgram);

// edit marketing program
router.patch("/editMarketingProgram/:programId", verifyJWT, editMarketingProgram);

// get all programs
router.post("/getAllMarketingProgramsForAdmin", verifyJWT, getAllMarketingProgramForAdmin);

// get all program for vendor
router.post("/getAllMarketingProgramsForVendor", verifyJWT, getAllMarketingProgramForVendor);

// get particular program
router.get("/getMarketingProgram/:programId",verifyJWT, getMarketingProgram);

// delete marketing program
router.delete("/deleteMarketingProgram/:programId", verifyJWT, deleteMarketingProgram);


module.exports = router;