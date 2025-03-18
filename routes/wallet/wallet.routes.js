
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createOrGetWallet, addTranstionData, getLedger, getLedgerByUserId} = require('../../controllers/wallet/wallet.controllers.js');



const router = express.Router();

// create wallet
router.post("/createWallet", verifyJWT, createOrGetWallet);

// add transtions in wallets
router.post("/addDataToWallet", addTranstionData);

// get user ledger 
router.get("/getLedger", verifyJWT, getLedger);

// get ledger by user id
router.get("/getLedgerByUserId/:userId", verifyJWT, getLedger);


module.exports = router;