import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  loginUser,
  registerUser,
  verifyOtp,
  sendOtp,
  logoutUser,
  resetPassword,
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verifyOtp").post(verifyOtp);
router.route("/sendOtp").post(sendOtp);
router.route("/resetPassword").post(resetPassword);
router.route("/logoutUser").post(verifyJWT, logoutUser);

export default router;
