import Order from "../models/order.model.js";
import { v4 as uuidv4 } from "uuid";
// import Product from "../models/product.models.js";
// import { User } from "../models/user.models.js";
// const { sendMail, invoiceTemplate } = require("../services/common");

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
    console.log("----.", order);

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
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

const fetchAllOrders = async (req, res) => {
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let query = Order.find({ deleted: { $ne: true } });
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });

  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  const totalDocs = await totalOrdersQuery.count().exec();
  console.log({ totalDocs });

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
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
