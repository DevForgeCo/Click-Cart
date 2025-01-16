import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { Otp } from "../models/otp.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { generateOtp } from "../helpers/otpgenerator.js";
import verifyToken from "../helpers/verifyToken.js";
import bcrypt from "bcrypt";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  if (
    [fullName, email, password, confirmPassword].some(
      (field) => String(field).trim() === ""
    )
  ) {
    return res.status(400).json({
      status: 400,
      message: "This field is must Required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: 400,
      message: "Passwords do not match",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ fullName }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      status: 409,
      message: "This user already exists",
    });
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while registering the user",
    });
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User has been successfully registered")
    );
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // console.log("-------->", req.body);

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });
  }

  const { otp, otpExpiration } = await generateOtp(email);

  await Otp.create({
    OTP: otp,
    otpExpiration,
    user: user._id,
  });

  return res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${email}`,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { OTP } = req.body;

  const normalizedOtp = OTP.trim(); // Trim any extra spaces

  // Find the user by email or phone
  const user = await Otp.findOne({ OTP: normalizedOtp });

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "Invalid OTP",
    });
  }

  // Find the OTP associated with the user
  // const otpRecord = await Otp.findOne({ user: user._id, OTP: otp });

  // if (!otpRecord) {
  //   throw new apiError(400, "Invalid OTP");
  // }

  // Check if the OTP has expired
  if (user.otpExpiration < Date.now()) {
    return res.status(400).json({
      status: 400,
      message: "OTP has expired",
    });
  }

  // OTP is valid, you can now proceed with further actions, e.g., logging in the user, or marking the user as verified
  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });

  // Optionally, delete the OTP record after successful verification
  await user.deleteOne();
});
const resetPassword = asyncHandler(async (req, res) => {
  // console.log("Request headers", req.headers);
  const { newPassword, confirmPassword } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1]; // Assuming the token is sent in the authorization header

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized request",
    });
  }

  // Verify the token (You need a function to decode and verify the token)
  const decodedToken = verifyToken(token); // Assume verifyToken returns the userId

  console.log("---------", decodedToken);

  if (!decodedToken) {
    throw new apiError(401, "Invalid or expired token");
  }

  const userId = decodedToken._id; // Extract userId from the decoded token

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Find the user by ID from the token
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: 404,
      message: "User not found",
    });
  }
  // console.log("----->", user);
  // Hash the new password (assuming you have a hashPassword function)
  // const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  user.password = newPassword;
  await user.save();
  // console.log("----->", user);
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "Password has been reset successfully" });

  // return res
  //   .status(200)
  //   .clearCookie("accessToken", options)
  //   .clearCookie("refreshToken", options)
  //   .json(new ApiResponse(200, {}, "User logged Out"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    return res.status(400).json({
      status: 400,
      message: "Email or Username and password is required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid Email format",
    });
  }

  const user = await User.findOne({
    $or: [{ email }, { password }],
  });
  if (!user) {
    return res.status(400).json({
      status: 400,
      message: "User does not exist",
    });
  }
  console.log("User found in DB:", user);
  console.log("Entered password:", password);

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password validation result:", isPasswordValid);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 401,
      message: "Invalid User Credentials",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refresToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized Request",
    });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = User.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid refreshToken",
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({
        status: 401,
        message: "RefreshToken is expired or used",
      });
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refresToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

export {
  registerUser,
  loginUser,
  verifyOtp,
  sendOtp,
  logoutUser,
  resetPassword,
  refreshAccessToken,
};
