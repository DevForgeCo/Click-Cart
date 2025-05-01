import { Router } from "express";
import isAdmin from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  fetchOrdersByUser,
  createOrder,
  deleteOrder,
  fetchAllOrders,
  updateOrderStatus,
  getMonthlySales,
  cancelOrder,
} from "../controllers/order.controllers.js";

const router = Router();

// user ke routes hen
router.post("/create", createOrder);
router.get("/user/:userId", fetchOrdersByUser);
router.patch("/cancel/:orderId/:userId", cancelOrder);

// admin or general routes
router.get("/all", isAdmin, fetchAllOrders);
router.delete("/:orderId", isAdmin, deleteOrder);
router.put("/:orderId/status", isAdmin, updateOrderStatus);
router.get("/order-sales/monthly", isAdmin, getMonthlySales);

export default router;
