const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {createCommission, getAllCommissionForAdmin, getCommissionGetterWise, getCommissionGiverWise, editCommission} = require('../../controllers/commission/commission.controllers.js');



const router = express.Router();

// register bank details
router.post("/createCommission", createCommission);

// get all bank account
router.get("/getAllCommissionForAdmin", getAllCommissionForAdmin);

router.patch("/editCommission/:commmissionId", editCommission);


// // get single account
// router.get("/getBankDetails/:accountId", verifyJWT, getSinglebankAccount);

// // delete bank detail
// router.delete("/deleteBankDetail/:accountId", verifyJWT, deleteBankDetails);





module.exports = router;