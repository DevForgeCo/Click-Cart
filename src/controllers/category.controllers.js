// categoryController.js
const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(ApiResponse.success(category));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findByIdAndUpdate(categoryId, req.body, {
      new: true,
    });
    res.status(200).json(ApiResponse.success(category));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json(ApiResponse.success("Category deleted successfully"));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(ApiResponse.success(categories));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};
