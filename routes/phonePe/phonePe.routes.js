const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const { createpayment, status } = require('../../controllers/phonepe/phonepeIntegration.controllers.js');



const router = express.Router();

// create register receipt
router.post("/createPayment", verifyJWT, createpayment);

router.post("/checkStatus/:orderId", verifyJWT, status);











module.exports = router;