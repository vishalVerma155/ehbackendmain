
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createOrGetWallet, addTranstionData, getLedger, getLedgerByUserId, getWallterCurrUser} = require('../../controllers/wallet/wallet.controllers.js');



const router = express.Router();

// create wallet
router.post("/createWallet/:userId", createOrGetWallet);

// add transtions in wallets
router.post("/addDataToWallet", addTranstionData);

// get wallet 
router.get("/getCurrUserWallet", verifyJWT, getWallterCurrUser);

// get user ledger 
router.get("/getLedger", verifyJWT, getLedger);

// get ledger by user id
router.get("/getLedgerByUserId/:userId", verifyJWT, getLedgerByUserId);


module.exports = router;