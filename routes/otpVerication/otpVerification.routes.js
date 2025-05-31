const express = require('express');
const { verifyEmailAndPhone } = require('../../controllers/user/otpVerification/otpVerification.controllers.js');



const router = express.Router();

router.post("/verifyEmailAndPhone", verifyEmailAndPhone);







module.exports = router;