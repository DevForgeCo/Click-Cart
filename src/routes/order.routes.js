import { Router } from "express";
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
router.get("/all", fetchAllOrders);
router.delete("/:orderId", deleteOrder);
router.put("/:orderId/status", updateOrderStatus);

export default router;
