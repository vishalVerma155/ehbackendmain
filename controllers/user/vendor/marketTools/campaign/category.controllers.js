const Category = require("../../../../../models/user/vendor/marketTools/campaigns/category.model.js");

// CREATE category (Admin only)
const createCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Only admin can create category" });
        }

        const { name } = req.body;
        if (!name || name && name.trim() === '') {
            return res.status(403).json({ success: false, error: "Only admin can create category" });
        }

        const category = new Category({ name });
        await category.save();

        return res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// READ all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// DELETE category (Admin only)
const deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Only admin can delete category" });
        }

        const categoryId = req.params.categoryId;
        const deleted = await Category.findByIdAndDelete(categoryId);

        if (!deleted) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory
};
