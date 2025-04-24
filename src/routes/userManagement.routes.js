import { Router } from "express";

import {
  getAllUsers,
  deleteUser,
} from "../controllers/userManagement.controller.js";

const router = Router();

router.route("/getAllUsers").get(getAllUsers);
router.route("/deletUser/:userId").delete(deleteUser);

export default router;
