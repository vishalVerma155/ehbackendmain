const express = require('express');
const verifyJWT = require('../../middleware/authMiddleware.js');
const { createNotification, getUserNotifications, deleteNotification, getNotificationById } = require('../../controllers/notification/notification.controllers.js');



const router = express.Router();

router.post("/createNotification", createNotification);

router.get("/getAllNotifications", verifyJWT, getUserNotifications);

router.delete("/deleteNotification/:notificationId", verifyJWT, deleteNotification);

router.get("/getNotificationById/:notificationId", verifyJWT, getNotificationById);





module.exports = router;