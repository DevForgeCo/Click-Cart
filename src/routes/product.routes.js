import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controllers.js";

const router = Router();

router.route("/createProduct").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProduct
);
router.route("/fetchAllProducts").get(fetchAllProducts);
router.route("/fetchProductById/:id").get(fetchProductById);
router.route("/updateProduct").put(verifyJWT, updateProduct);
router.route("/deleteProduct").delete(deleteProduct);

// router.post("/create", verifyJWT, createProduct); // Only authenticated users can create products
// router.get("/:id", getProduct); // Public route to get product details by ID
// router.put("/:id", verifyJWT, updateProduct); // Authenticated users can update product details
// router.delete("/:id", verifyJWT, deleteProduct); // Authenticated users can delete products
// router.get("/", listProducts); // Public route to list all products

export default router;
