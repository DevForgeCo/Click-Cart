import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  loginUser,
  registerUser,
  verifyOtp,
  sendOtp,
  logoutUser,
  refreshAccessToken,
  resetPassword,
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/login").post(loginUser);
// router.route("/forgotPassword").post(verifyJWT, forgotPassword);
router.route("/verifyOtp").post(verifyJWT, verifyOtp);
router.route("/sendOtp").post(verifyJWT, sendOtp);
router.route("/resetPassword").post(resetPassword);
router.route("/logoutUser").post(verifyJWT, logoutUser);
export default router;
