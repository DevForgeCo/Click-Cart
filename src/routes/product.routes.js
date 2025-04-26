import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";
import {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/product.controllers.js";

const router = Router();

router.route("/createProduct").post(isAdmin, createProduct);
router.route("/fetchAllProducts").get(fetchAllProducts);
router.route("/fetchProductById/:id").get(fetchProductById);
router.route("/updateProduct/:id").put(isAdmin, updateProduct);
router.route("/deleteProduct/:id").delete(isAdmin, deleteProduct);
router.route("/products/search").get(searchProducts);

export default router;
