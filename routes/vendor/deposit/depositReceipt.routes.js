

const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const { createDepositReceipt} = require('../../../controllers/user/vendor/deposit/depositReceipt.controllers.js');



const router = express.Router();

// create register receipt
router.post("/createReceipt", verifyJWT, createDepositReceipt);









module.exports = router;