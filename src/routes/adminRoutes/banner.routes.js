import { Router } from "express";
import isAdmin from "../../middlewares/admin.middleware.js";
import {
  createBanner,
  getAllBanners,
  deleteBanner,
} from "../../controllers/adminControllers/banner.controller.js";

const router = Router();

router.post("/upload-banners", isAdmin, createBanner);
router.get("/get-banners", isAdmin, getAllBanners);
router.delete("/delet-banners/:id", isAdmin, deleteBanner);

export default router;