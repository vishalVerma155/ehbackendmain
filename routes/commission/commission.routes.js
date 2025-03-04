const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {createCommission} = require('../../controllers/commission/commission.controllers.js');



const router = express.Router();

// register bank details
router.post("/createCommission", createCommission);

// // get all bank account
// router.get("/getAllBankDetails", verifyJWT, getAllAccounts);

// // get single account
// router.get("/getBankDetails/:accountId", verifyJWT, getSinglebankAccount);

// // delete bank detail
// router.delete("/deleteBankDetail/:accountId", verifyJWT, deleteBankDetails);





module.exports = router;