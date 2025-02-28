import Cart from "../models/cart.models.js";
import Product from "../models/product.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const addItemToCart = asyncHandler(async (req, res) => {
  const { user, product, quantity } = req.body;

  if (!user || !product || !quantity) {
    throw new apiError(400, "User, product, and quantity are required.");
  }

  const productExists = await Product.findById(product);
  if (!productExists) {
    throw new apiError(404, "Product not found.");
  }

  let cartItem = await Cart.findOne({ user, product });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
    return res
      .status(200)
      .json(new ApiResponse(200, cartItem, "Cart item updated."));
  }

  cartItem = new Cart({
    user,
    product,
    quantity,
  });

  await cartItem.save();
  res.status(201).json(new ApiResponse(201, cartItem, "Item added to cart."));
});

export const getCartItems = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const cartItems = await Cart.find({ user: userId })
    .populate("product", "product_name price thumbnail")
    .exec();

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        cartItems,
        totalAmount,
        "Cart items fetched successfully."
      )
    );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  console.log(cartItemId, quantity);

  const cartItem = await Cart.findById(cartItemId);

  if (!cartItem) {
    throw new apiError(404, "Cart item not found.");
  }

  if (quantity !== undefined) cartItem.quantity = quantity;

  await cartItem.save();
  res.status(200).json(new ApiResponse(200, cartItem, "Cart item updated."));
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;

  const cartItem = await Cart.findByIdAndDelete(cartItemId);

  if (!cartItem) {
    throw new apiError(404, "Cart item not found.");
  }

  res.status(200).json(new ApiResponse(200, null, "Cart item deleted."));
});

export const clearCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Cart.deleteMany({ user: userId });
  res.status(200).json(new ApiResponse(200, null, "Cart cleared."));
});
