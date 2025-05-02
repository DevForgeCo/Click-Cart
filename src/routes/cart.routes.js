import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addItemToCart,
  getCartItems,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controllers.js";

const router = Router();

router.route("/addItemToCart").post(addItemToCart);
router.route("/getCartItems/:userId").get(getCartItems);
router.route("/updateCartItem/:cartItemId").put(updateCartItem);
router.route("/deleteCartItem/:cartItemId").delete(deleteCartItem);

export default router;
