import { Router } from "express";
import isAdmin from "../middlewares/admin.middleware.js";
import {
  fetchOrdersByUser,
  createOrder,
  deleteOrder,
  fetchAllOrders,
  updateOrderStatus,
} from "../controllers/order.controllers.js";

const router = Router();

// user ke routes hen
router.post("/create", createOrder);
router.get("/user/:userId", fetchOrdersByUser);

// admin or general routes
router.get("/all", isAdmin, fetchAllOrders);
router.delete("/:orderId", isAdmin, deleteOrder);
router.put("/:orderId/status", isAdmin, updateOrderStatus);

export default router;
