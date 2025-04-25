import { Admin } from "../../models/adminModels/admin.models.js";
import { ApiResponse } from "../../utils/apiResponse.js";

const generateTokens = async (adminId) => {
  const admin = await Admin.findById(adminId);
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerAdmin = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (
    [fullName, email, password, confirmPassword].some((field) => !field?.trim())
  ) {
    return res.status(400).json({
      status: 400,
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: 400,
      message: "Passwords do not match",
    });
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(409).json({
      status: 409,
      message: "This user already exists",
    });
  }

  const newAdmin = await Admin.create({
    fullName,
    email,
    password,
    role: "admin",
  });

  const safeAdmin = await Admin.findById(newAdmin._id).select(
    "-password -refreshToken"
  );

  return res.status(200).json({
    status: 200,
    success: true,
    message: "Admin has been  registered successfully",
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(400).json({
      status: 400,
      message: "Email or Username and password is required",
    });
  }

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email and Password",
    });
  }

  const { accessToken, refreshToken } = await generateTokens(admin._id);
  const safeAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("adminAccessToken", accessToken, cookieOptions)
    .cookie("adminRefreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { admin: safeAdmin, accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
};

const logoutAdmin = async (req, res) => {
  await Admin.findByIdAndUpdate(req.admin?._id, {
    $unset: { refreshToken: 1 },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("adminAccessToken", cookieOptions)
    .clearCookie("adminRefreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
};

export { registerAdmin, loginAdmin, logoutAdmin };
