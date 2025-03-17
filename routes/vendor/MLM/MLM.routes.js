
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const { createMLM, editMLM } = require('../../../controllers/user/vendor/MLM/MLM.controllers.js');



const router = express.Router();

// create MLM
router.post("/createMLM/:userId",verifyJWT, createMLM);

// edit mlm
router.patch("/editMLM/:mlmId", verifyJWT, editMLM);


module.exports = router;