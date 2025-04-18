import Order from "../models/order.model.js";
import { v4 as uuidv4 } from "uuid";

const fetchOrdersByUser = async (req, res) => {
  const { id } = req.body;
  console.log(req.body);
  try {
    const orders = await Order.find({ user: id });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      user,
      items,
      total_amount,
      discount_amount = 0,
      gross_amount,
      shipping_amount = 0,
      net_amount,
      selectedAddress,
    } = req.body;

    if (
      !items ||
      !items.length ||
      !total_amount ||
      !gross_amount ||
      !net_amount ||
      !selectedAddress
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    console.log("req.body", req.body);

    const order = new Order({
      order_number: `ORD-${uuidv4().split("-")[0].toUpperCase()}`,
      items,
      user,
      total_amount,
      discount_amount,
      gross_amount,
      shipping_amount,
      net_amount,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
      status: "pending",
      selectedAddress,
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "placed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findOneAndUpdate(
      { order_number: orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOneAndDelete({ order_number: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted", order });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete order", error: err });
  }
};

const fetchAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export {
  fetchAllOrders,
  updateOrder,
  deleteOrder,
  createOrder,
  fetchOrdersByUser,
  updateOrderStatus,
};
