
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createOrGetWallet} = require('../../controllers/wallet/wallet.controllers.js');



const router = express.Router();

// create marketing program
router.post("/createWallet", verifyJWT, createOrGetWallet);



module.exports = router;