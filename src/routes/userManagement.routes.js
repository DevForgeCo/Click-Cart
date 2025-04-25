import { Router } from "express";

import {
  getAllUsers,
  deleteUser,
  searchUsers,
} from "../controllers/userManagement.controller.js";

const router = Router();

router.route("/getAllUsers").get(getAllUsers);
router.route("/deletUser/:userId").delete(deleteUser);
router.route("/searchUser").get(searchUsers);

export default router;
