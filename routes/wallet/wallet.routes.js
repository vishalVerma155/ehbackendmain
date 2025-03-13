
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createOrGetWallet, addTranstionData} = require('../../controllers/wallet/wallet.controllers.js');



const router = express.Router();

// create marketing program
router.post("/createWallet", verifyJWT, createOrGetWallet);
router.post("/addDataToWallet", addTranstionData);



module.exports = router;