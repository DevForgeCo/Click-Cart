import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    OTP: {
      type: String,
      required: [true, "OTP is required"],
      minlength: [6, "OTP must be at least 6 characters long"],
      maxlength: [6, "OTP can be at most 6 characters long"],
    },
    otpExpiration: {
      type: Date,
      default: Date.now,
      get: (otpExpiration) => otpExpiration.getTime(),
      set: (otpExpiration) => new Date(otpExpiration),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
