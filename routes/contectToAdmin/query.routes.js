const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {registerQueries, viewQueris, viewSingleQuery, editQuery, viewQuerisOfUser } = require('../../controllers/user/contectToAdmin/queries.controllers.js');
const {upload} = require('../../utils/multer.js');


const router = express.Router();

// contect to admin or queries register
router.post("/registerQuery", verifyJWT, upload.single("attachment"), registerQueries);

// view all queries
router.get("/getAllQueriesAdmin", verifyJWT, viewQueris);

// view all queries for user
router.get("/getAllQueriesUser", verifyJWT, viewQuerisOfUser);

// view particular query
router.get("/getQuery/:queryId", verifyJWT, viewSingleQuery);

// update or edit query
router.patch("/editQuery/:queryId", verifyJWT, editQuery);

// delete query
// router.delete("/deleteQuery/:queryId", verifyJWT, deleteQuery);


module.exports = router;


