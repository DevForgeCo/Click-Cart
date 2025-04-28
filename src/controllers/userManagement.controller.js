import { User } from "../models/user.models.js";

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, "-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Search query is required"));
    }

    const searchRegex = new RegExp(query, "i");

    const users = await User.find({
      $or: [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    }).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      users,
    });
  } catch (error) {
    console.error("Error in searchUsers:", error.message);

    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

export { getAllUsers, deleteUser, searchUsers };
