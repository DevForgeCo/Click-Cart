import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishList.controllers.js";

const router = Router();

router.route("/addTo-wishlist").post(addToWishlist);
router.route("/get-wishlist").get(getWishlist);
router.route("/remove-wishlist").delete(removeFromWishlist);

export default router;
