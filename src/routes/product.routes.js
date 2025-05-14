import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";
import {
  createProduct,
  fetchAllProductsByAdmin,
  fetchProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  fetchAllProductsByClient,
} from "../controllers/product.controllers.js";

const router = Router();

router.route("/createProduct").post(isAdmin, createProduct);
router.route("/fetchAllProductsByAdmin").get(fetchAllProductsByAdmin);
router.route("/fetchAllProductsByClient").get(fetchAllProductsByClient);
router.route("/fetchProductById/:id").get(fetchProductById);
router.route("/updateProduct/:id").put(isAdmin, updateProduct);
router.route("/deleteProduct/:id").delete(isAdmin, deleteProduct);
router.route("/products/search").get(searchProducts);

export default router;
