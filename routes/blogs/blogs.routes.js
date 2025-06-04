const verifyJWT = require('../../middleware/authMiddleware.js');
const express = require('express');
const {createBlog, getAllBlogs, getBlogById, deleteBlog, updateBlog} = require('../../controllers/blogs/blogs.controllers.js')
const {upload} = require('../../utils/multer.js')


const router = express.Router();

// register bank details
router.post("/createBlog", verifyJWT, upload.single('coverImage'), createBlog);

// get all bank account
router.get("/getAllBlogs", getAllBlogs);

// get single account
router.get("/getBlog/:id", getBlogById);

router.patch("/updateBlog/:id", verifyJWT,upload.single('coverImage'), updateBlog);
// delete bank detail
router.delete("/deleteBlog/:id", verifyJWT, deleteBlog);

module.exports = router;