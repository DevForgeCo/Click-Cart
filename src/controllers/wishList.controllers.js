import Wishlist from "../models/wishlist.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import apiError from "../utils/apiErrors.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new apiError(400, "Product ID is required.");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: userId,
      products: [productId],
    });
  } else {
    if (wishlist.products.includes(productId)) {
      throw new apiError(400, "Product already exists in the wishlist.");
    }
    wishlist.products.push(productId);
  }

  await wishlist.save();

  res
    .status(201)
    .json(
      new ApiResponse(201, wishlist, "Product added to wishlist successfully.")
    );
});

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "products"
  );

  if (!wishlist) {
    throw new apiError(404, "Wishlist not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist fetched successfully."));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new apiError(400, "Product ID is required.");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new apiError(404, "Wishlist not found.");
  }

  wishlist.products = wishlist.products.filter(
    (product) => product.toString() !== productId
  );

  await wishlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        wishlist,
        "Product removed from wishlist successfully."
      )
    );
});

export { addToWishlist, getWishlist, removeFromWishlist };
