import Category from "../../models/event.category.model.js";
export const addCategory = async (req, res) => {
    try {
        const { name, description, adminId } = req.body;
        if (!name)
            return res.status(400).json({ message: "name is required." });
        if (!adminId)
            return res.status(400).json({ message: "adminId is required." });
        const category = await Category.findOne({ name: name.toLowerCase() });
        if (category)
            return res.status(409).json({ message: "this name is already used for category." });
        await Category.create({
            name, description, createdBy: adminId
        });
        res.status(201).json({ message: "add new Category successfully." });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err?.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
};
export const updateCategory = async (req, res) => {
    try {
        const { id, name, description, adminId } = req.body;
        if (!id)
            return res.status(400).json({ message: "category id is required." });
        if (!adminId)
            return res.status(400).json({ message: "adminId is required." });
        const category = await Category.findById(id);
        if (!category)
            return res.status(404).json({ message: "category not found." });
        if (name) {
            const existing = await Category.findOne({ name: name.toLowerCase() });
            if (existing && existing._id.toString() !== id) {
                return res.status(409).json({ message: "this name is already used for category." });
            }
            category.name = name;
        }
        if (description)
            category.description = description;
        await category.save();
        res.status(200).json({ message: "category updated successfully." });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "category id is required." });
        const category = await Category.findById(id);
        if (!category)
            return res.status(404).json({ message: "category not found." });
        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: "category deleted successfully." });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
};
export const getAllCategories = async (_req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "categories fetched successfully.",
            data: categories
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "category id is required." });
        const category = await Category.findById(id);
        if (!category)
            return res.status(404).json({ message: "category not found." });
        res.status(200).json({
            message: "category fetched successfully.",
            data: category
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
};
//# sourceMappingURL=category.controller.js.map