// dashboardController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardMetrics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const lowInventoryProducts = await Product.find({ stock: { $lt: 10 } });

    const metrics = {
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      pendingOrders,
      lowInventoryProducts: lowInventoryProducts.length,
    };

    res.status(200).json(ApiResponse.success(metrics));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};
