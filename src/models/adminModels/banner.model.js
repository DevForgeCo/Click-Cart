import mongoose, { Schema } from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);
