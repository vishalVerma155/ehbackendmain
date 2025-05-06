
const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const { createSaleEvent, totalSaleUser, getAllSaleForAdmin, topMostSoldProducts } = require('../../controllers/saleEvent/saleEvent.controllers.js');



const router = express.Router();

router.post("/createSaleEvent", createSaleEvent);

router.post("/totalSaleUser", verifyJWT, totalSaleUser);

router.post("/getAllSale", verifyJWT, getAllSaleForAdmin);

router.post("/topMostSoldProducts", verifyJWT, topMostSoldProducts);




module.exports = router;