import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addItemToCart,
  getCartItems,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controllers.js";

const router = Router();

router.route("/addItemToCart").post(addItemToCart);
router.route("/getCartItems/:userId").get(getCartItems);
router.route("/updateCartItem/:cartItemId").put(verifyJWT, updateCartItem);
router.route("/deleteCartItem/:cartItemId").delete(verifyJWT, deleteCartItem);

export default router;
