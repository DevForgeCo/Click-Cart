import Product from "../models/product.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addReview = asyncHandler(async (req, res) => {
  const { productId, userId, rating, comment } = req.body;
  console.log(productId, userId, rating, comment);

  if (!productId || !userId || !rating || !comment) {
    return res.status(400).json({
      status: 400,
      message:
        "Missing required fields: productId, userId, rating, or comment.",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }

  const newReview = {
    userId,
    rating,
    comment,
  };

  product.reviews.push(newReview);
  await product.save();

  res.status(201).json({
    status: 201,
    success: true,
    message: "Review added successfully",
    data: newReview,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).populate("reviews");

  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: product.reviews,
  });
});

export { addReview, getProductReviews };
