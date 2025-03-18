
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createOrGetWallet, addTranstionData, getLedger} = require('../../controllers/wallet/wallet.controllers.js');



const router = express.Router();

// create wallet
router.post("/createWallet", verifyJWT, createOrGetWallet);

// add transtions in wallets
router.post("/addDataToWallet", addTranstionData);

// get user ledger 
router.get("/getLedger", verifyJWT, getLedger);



module.exports = router;