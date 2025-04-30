
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {createWithdrawalRequest, getAllWithdrawalRequest, getAllWithdrawalRequestUser, editWithdrawalRequest} = require('../../../controllers/user/withdrawal/withdrwal.controllers.js');



const router = express.Router();

// create withdrawal request
router.post("/createWithdrawalRequest",verifyJWT, createWithdrawalRequest);

// get all withdrawal request
router.post("/getAllWithdrawalRequest",verifyJWT, getAllWithdrawalRequest);

// get all withdrawal request of loged in user
router.post("/getAllWithdrawalRequestUser",verifyJWT, getAllWithdrawalRequestUser);

// edit withdrawal request
router.patch("/editWithdrawalRequest",verifyJWT, editWithdrawalRequest);

// // get wallet 
// router.get("/getCurrUserWallet", verifyJWT, getWallterCurrUser);

// // get user ledger 
// router.get("/getLedger", verifyJWT, getLedger);

// // get ledger by user id
// router.get("/getLedgerByUserId/:userId", verifyJWT, getLedgerByUserId);


module.exports = router;