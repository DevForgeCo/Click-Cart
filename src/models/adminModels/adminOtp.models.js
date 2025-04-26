import mongoose, { Schema } from "mongoose";

const adminOtpSchema = new Schema(
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
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export const adminOtp = mongoose.model("adminOtp", adminOtpSchema);
