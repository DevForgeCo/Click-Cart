// userController.js
const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(ApiResponse.success(users));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.status(200).json(ApiResponse.success(user));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json(ApiResponse.success("User deleted successfully"));
  } catch (error) {
    res.status(500).json(apiError.serverError(error.message));
  }
};
