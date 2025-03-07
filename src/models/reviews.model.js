import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
  productID: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
});
