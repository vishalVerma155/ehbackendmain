
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const { createSaleEvent, totalSaleUser } = require('../../controllers/saleEvent/saleEvent.controllers.js');



const router = express.Router();

router.post("/createSaleEvent", createSaleEvent);

router.post("/totalSaleUser", verifyJWT, totalSaleUser);




module.exports = router;