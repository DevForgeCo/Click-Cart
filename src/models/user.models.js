import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import apiError from "../utils/apiErrors.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    // role: {
    //   type: String,
    //   enum: ["user", "admin"],
    //   default: "user", // Default role is user, but you can set "admin" for admins
    // // },
    // isActive: { type: Boolean, default: true },
    // refreshToken: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

// Hash password before saving if it has been modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const passwordRegex = /^.{8,}$/;
  if (!passwordRegex.test(this.password)) {
    return next(
      new apiError(400, "Password must be at least 8 characters long")
    );
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check if the provided password matches the hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET
  );
};

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);

// The commented-out code below can be moved to its own section for easier readability and future reference:

/*
  // fullName: {
  //   type: String,
  //   unique: true,
  //   required: [true, "Username is required"],
  //   trim: true,
  //   minlength: [3, "Username must be at least 3 characters long"],
  //   validate: {
  //     validator: function (value) {
  //       // Regular expression to ensure at least one number and one special character (@ or _)
  //       const regex = /^(?=.*[0-9])(?=.*[@_])/;
  //       return regex.test(value);
  //     },
  //     message: (props) =>
  //       `${props.value} is not a valid username! It must include at least one number and one special character (@ or _).`,
  //   },
  //   index: true,
  // },
  // emailOrPhone: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function (value) {
  //       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //       const phoneRegex = /^\+\d{1,3}\d{4,14}(?:x.+)?$/;
  //       return emailRegex.test(value) || phoneRegex.test(value);
  //     },
  //     message: (props) =>
  //       `${props.value} is not a valid email or phone number!`,
  //   },
  // },
*/
