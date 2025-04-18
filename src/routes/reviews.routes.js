import { Router } from "express";
import {
  addReview,
  getProductReviews,
} from "../controllers/reviews.controllers.js";

const router = Router();

router.route("/add-reviews").post(addReview);
router.route("/get-reviews/:productId").get(getProductReviews);
export default router;
