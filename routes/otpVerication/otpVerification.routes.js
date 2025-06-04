const express = require('express');
const { verifyEmailAndPhone, verifyOTP } = require('../../controllers/user/otpVerification/otpVerification.controllers.js');



const router = express.Router();

router.post("/verifyEmailAndPhone", verifyEmailAndPhone);

router.post("/verifyOtp", verifyOTP);






module.exports = router;