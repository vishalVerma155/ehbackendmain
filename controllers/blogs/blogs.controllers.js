const Blog = require("../../models/blogs/blogs.model.js");


// Create Blog
const createBlog = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(400).json({ success: false, error: "Only admin can do this" });
        }
        const { title, subtitle, content, sections } = req.body;

        const coverImage = req.file?.path || undefined;

        if (!title || title && title.trim() === "" || !content || content && content.trim() === "") {
            return res.status(400).json({ success: false, error: "Required fields missing" });
        }


        const blog = new Blog({ coverImage, title, subtitle, content, sections });
        await blog.save();

        return res.status(201).json({ success: true, blog });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Server Error", details: err.message });
    }
};

// Get All Blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, blogs });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Get Blog by ID
const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!blogId) {
            return res.status(404).json({ success: false, error: "Blog id not found" });
        }
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, error: "Blog not found" });

        return res.status(200).json({ success: true, blog });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Update Blog
const updateBlog = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }

        const blogId = req.params.id;
        const coverImage = req.file?.path || undefined;
        const data = req.body;
        const payload = {...data}


        if(coverImage){
            payload.coverImage = coverImage;
        }

        if (!blogId) {
            return res.status(404).json({ success: false, error: "Blog id not found" });
        }
        const updated = await Blog.findByIdAndUpdate(blogId, payload , { new: true });
        if (!updated) return res.status(404).json({ success: false, error: "Blog not found" });

        return res.status(200).json({ success: true, blog: updated });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Delete Blog
const deleteBlog = async (req, res) => {
    try {

        if (req.user.role !== 'admin') {
            return res.status(404).json({ success: false, error: "Only admin can do this" });
        }

        const blogId = req.params.id;

        if (!blogId) {
            return res.status(404).json({ success: false, error: "Blog id not found" });
        }
        const deleted = await Blog.findByIdAndDelete(blogId);
        if (!deleted) return res.status(404).json({ success: false, error: "Blog not found" });

        return res.status(200).json({ success: true, message: "Blog deleted" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createBlog, getAllBlogs, getBlogById, deleteBlog, updateBlog }
