import Product from "../models/product.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import Review from "../models/reviews.model.js";

const addReview = asyncHandler(async (req, res) => {
  const { productId, userId, rating, comment } = req.body;

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

  const newReview = new Review({
    productId,
    userId,
    rating,
    comment,
  });

  const createdReview = await newReview.save();

  product.reviews.push(createdReview._id);
  await product.save();

  res.status(201).json({
    status: 201,
    success: true,
    message: "Review added successfully",
    data: createdReview,
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
