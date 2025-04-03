


const express = require('express');
// const verifyJWT = require('../../../middleware/authMiddleware.js');
const {distributeCommision} = require('../../../controllers/commissionDistribution/commissionDistribution.controllers.js');



const router = express.Router();

// create register receipt
router.post("/commissionDistribute", distributeCommision);









module.exports = router;