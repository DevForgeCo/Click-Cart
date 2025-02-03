import Cart from "../models/cart.models.js";

export const addItemToCart = async (req, res) => {
  try {
    const { user, product, product_variant, quantity } = req.body;

    if (!user || !product || !quantity) {
      return res
        .status(400)
        .json({ message: "User, product, and quantity are required." });
    }

    const existingCartItem = await Cart.findOne({ user, product });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res
        .status(200)
        .json({ message: "Cart item updated.", cart: existingCartItem });
    }

    const newCartItem = new Cart({
      user,
      product,
      product_variant,
      quantity,
    });

    await newCartItem.save();
    res.status(201).json({ message: "Item added to cart.", cart: newCartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.find({ user: userId })
      .populate("product", "name price")
      .populate("product_variant.size product_variant.color");

    res.status(200).json({ cartItems });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity, product_variant } = req.body;

    const cartItem = await Cart.findById(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (quantity !== undefined) cartItem.quantity = quantity;
    if (product_variant) cartItem.product_variant = product_variant;

    await cartItem.save();
    res.status(200).json({ message: "Cart item updated.", cart: cartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await Cart.findByIdAndDelete(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.status(200).json({ message: "Cart item deleted." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    await Cart.deleteMany({ user: userId });
    res.status(200).json({ message: "Cart cleared." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
