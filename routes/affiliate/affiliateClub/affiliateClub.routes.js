
const express = require('express');
const verifyJWT = require('../../../middleware/authMiddleware.js');
const {createClub, getAllClubs, getClubById, updateClub, deleteClub, getAllClubMember} = require('../../../controllers/user/affiliate/soloSale/affiliateClub.controllers.js');




const router = express.Router();

router.post("/createClub", verifyJWT, createClub);

router.get("/getAllClubs", verifyJWT, getAllClubs);

router.get("/getClubById/:clubId", verifyJWT, getClubById);

router.patch("/updateClub/:clubId", verifyJWT, updateClub);

router.delete("/deleteClub/:clubId", verifyJWT, deleteClub);

router.post("/getAllClubMember", verifyJWT, getAllClubMember);


module.exports = router;