const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {registerUpiId, getAllUpiId, getSingleUpiId, deleteUpiId} = require('../../controllers/user/bankDetails/upi.controllers.js')



const router = express.Router();

// register bank details
router.post("/registerUpiDetails", verifyJWT, registerUpiId);

// get all bank account
router.get("/getAllUpiDetails", verifyJWT, getAllUpiId);

// get single account
router.get("/getUpiDetails/:upiId", verifyJWT, getSingleUpiId);

// delete bank detail
router.delete("/deleteUpiDetail/:upiId", verifyJWT, deleteUpiId);

module.exports = router;
