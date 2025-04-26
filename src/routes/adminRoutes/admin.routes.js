import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminPassword,
} from "../../controllers/adminControllers/authentication.controller.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/login-admin", loginAdmin);
router.post("/logout-admin", logoutAdmin);
router.route("/sendOtp").post(sendAdminOtp);
router.route("/verifyOtp").post(verifyAdminOtp);
router.route("/resetPassword").post(resetAdminPassword);

export default router;
