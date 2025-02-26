
const express = require('express');
const {createImpersonate} = require('../../../controllers/admin/impersonate-user/impersonate-user.controllers.js');
const verifyJWT = require('../../../middleware/authMiddleware.js');



const router = express.Router();

router.post("/impersonate-user", verifyJWT, createImpersonate);







module.exports = router;