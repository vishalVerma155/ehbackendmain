const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const { createpayment, status, callback } = require('../../controllers/phonepe/phonepeIntegration.controllers.js');



const router = express.Router();

// create register receipt
router.post("/createPayment",  createpayment);

router.get("/checkStatus/:orderId", status);

router.post("/callback", callback);











module.exports = router;