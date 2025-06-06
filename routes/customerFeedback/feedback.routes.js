const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const {createFeedback, getAllFeedback, getFeedbackById, deleteFeedback } = require('../../controllers/customerFeedback/feedback.controllers.js');



const router = express.Router();

// create feedback
router.post("/createFeedback", createFeedback);

// get all feedback
router.get('/getAllFeedbacks', getAllFeedback);

// get single feedback
router.get("/getFeedback/:id", getFeedbackById);

// deletefeedback
router.delete("/deleteFeedback/:id",verifyJWT, deleteFeedback);




module.exports = router;