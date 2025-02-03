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
router.route("/getCartItems").get(getCartItems);
router.route("/updateCartItem").put(verifyJWT, updateCartItem);
router.route("/deleteCartItem").delete(verifyJWT, deleteCartItem);

export default router;
