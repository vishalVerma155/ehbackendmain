
const express = require('express');
// const verifyJWT = require('../../middleware/authMIddleware.js');
const {registerAdmin, loginAdmin, getAllUsersList} = require('../../controllers/admin/web/admin.web.controllers.js');



const router = express.Router();

// register affiliate with email and password
router.post("/registerAdmin", registerAdmin);

// login admin
router.post("/loginAdmin", loginAdmin);

// get users list
router.get("/getUsersList", getAllUsersList);





module.exports = router;