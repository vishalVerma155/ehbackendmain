const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {registerBankDetails, getAllAccounts, deleteBankDetails, getSinglebankAccount} = require('../../controllers/user/bankDetails/bankDetails.controllers.js')



const router = express.Router();

// register bank details
router.post("/registerBankDetails", verifyJWT, registerBankDetails);

// get all bank account
router.get("/getAllBankDetails", verifyJWT, getAllAccounts);

// get single account
router.get("/getBankDetails/:accountId", verifyJWT, getSinglebankAccount);

// delete bank detail
router.delete("/deleteBankDetail/:accountId", verifyJWT, deleteBankDetails);





module.exports = router;
