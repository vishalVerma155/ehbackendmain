

const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const { createDepositReceipt, getAllReceiptCurrentUser, getAllReceiptForAdmin} = require('../../../controllers/user/vendor/deposit/depositReceipt.controllers.js');



const router = express.Router();

// create register receipt
router.post("/createReceipt", verifyJWT, createDepositReceipt);

router.post("/getAllReceiptForUser", verifyJWT, getAllReceiptCurrentUser);

router.post("/getAllDepositReceiptAdmin", verifyJWT, getAllReceiptForAdmin);









module.exports = router;