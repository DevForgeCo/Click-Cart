import { Router } from "express";
import isAdmin from "../middlewares/admin.middleware.js";

import {
  getAllUsers,
  deleteUser,
  searchUsers,
} from "../controllers/userManagement.controller.js";

const router = Router();

router.route("/getAllUsers").get(isAdmin, getAllUsers);
router.route("/deletUser/:userId").delete(isAdmin, deleteUser);
router.route("/searchUser").get(isAdmin, searchUsers);

export default router;
