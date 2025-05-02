import { Admin } from "../../models/adminModels/admin.models.js";
import { adminOtp } from "../../models/adminModels/adminOtp.models.js";
import { generateOtp } from "../../helpers/otpgenerator.js";
import { ApiResponse } from "../../utils/apiResponse.js";

const generateTokens = async (adminId) => {
  const admin = await Admin.findById(adminId);
  const accessToken = admin.generateAccessToken();

  // admin.refreshToken = refreshToken;
  // await admin.save({ validateBeforeSave: false });

  return { accessToken };
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

  const { accessToken } = await generateTokens(admin._id);
  const safeAdmin = await Admin.findById(admin._id).select(
    "-password -accessToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("adminAccessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { admin: safeAdmin, accessToken },
        "Admin logged in successfully"
      )
    );
};

const sendAdminOtp = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({
      status: 404,
      message: "Admin not found",
    });
  }

  const { otp, otpExpiration } = await generateOtp(email);

  await adminOtp.create({
    OTP: otp,
    otpExpiration,
    adminUser: admin._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { adminId: admin._id },
        `OTP sent successfully to ${email}`
      )
    );
};

const verifyAdminOtp = async (req, res) => {
  const { otp } = req.body;

  const dbOtp = await adminOtp.findOne({ OTP: otp });
  if (!dbOtp) {
    return res.status(404).json({ status: 404, message: "Invalid OTP" });
  }

  if (dbOtp.otpExpiration < Date.now()) {
    return res.status(400).json({ status: 400, message: "OTP has expired" });
  }

  res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully"));
  await dbOtp.deleteOne();
};

const resetAdminPassword = async (req, res) => {
  const { adminId, newPassword, confirmPassword } = req.body;

  if (!adminId) {
    return res
      .status(401)
      .json({ status: 401, message: "Unauthorized request" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ status: 404, message: "Admin not found" });
  }

  admin.password = newPassword;
  await admin.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("adminAccessToken", options)
    .clearCookie("adminRefreshToken", options)
    .json(new ApiResponse(200, {}, "Password has been reset successfully"));
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

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminPassword,
};
