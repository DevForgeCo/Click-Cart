import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
} from "../../controllers/adminControllers/authentication.controller.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/login-admin", loginAdmin);
router.post("/logout-admin", logoutAdmin);

export default router;
