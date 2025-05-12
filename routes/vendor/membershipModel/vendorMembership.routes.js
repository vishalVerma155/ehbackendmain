

const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const { createMembership, getAllMemberships, getMembershipById, updateMembership, deleteMembership} = require('../../../controllers/user/vendor/vendorMembership/vendorMembership.controllers.js');
const {purchaseMembership} = require('../../../controllers/user/vendor/vendorMembership/vendorMembershipCard.controllers.js')


const router = express.Router();

router.post("/createMembershipModel", verifyJWT, createMembership);

router.get("/getAllMembership", verifyJWT, getAllMemberships);

router.get("/getMembershipModelById/:modelId", verifyJWT, getMembershipById);

router.patch("/updateMembershipModel/:modelId", verifyJWT, updateMembership);

router.delete("/deleteMembershipModel/:modelId", verifyJWT, deleteMembership);

router.post("/purchaseMembership", verifyJWT, purchaseMembership);










module.exports = router;