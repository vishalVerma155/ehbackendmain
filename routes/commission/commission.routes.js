const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {createCommission, getAllCommissionForAdmin, getCommissionGetterWise, getCommissionGiverWise, editCommission, commissionFilterApi} = require('../../controllers/commission/commission.controllers.js');



const router = express.Router();

// register bank details
router.post("/createCommission",verifyJWT, createCommission);

// get all bank account
router.get("/getAllCommissionForAdmin", getAllCommissionForAdmin);

router.patch("/editCommission/:commmissionId",verifyJWT, editCommission);

router.get("/filterCommission",verifyJWT, commissionFilterApi);


// get commission giver wise
router.get("/getCommissionGiver/:giverId", verifyJWT, getCommissionGiverWise);


// get commission getter wise
router.get("/getCommissionGetter/:giverId", verifyJWT, getCommissionGetterWise);

// // delete bank detail
// router.delete("/deleteBankDetail/:accountId", verifyJWT, deleteBankDetails);





module.exports = router;