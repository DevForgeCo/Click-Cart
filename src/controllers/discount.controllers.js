// discountController.js
const Discount = require("../models/Discount");

exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json(ApiResponse.success(discount));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.updateDiscount = async (req, res) => {
  const { discountId } = req.params;
  try {
    const discount = await Discount.findByIdAndUpdate(discountId, req.body, {
      new: true,
    });
    res.status(200).json(ApiResponse.success(discount));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.deleteDiscount = async (req, res) => {
  const { discountId } = req.params;
  try {
    await Discount.findByIdAndDelete(discountId);
    res.status(200).json(ApiResponse.success("Discount deleted successfully"));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};
