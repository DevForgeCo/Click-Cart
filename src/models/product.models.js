import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 255,
    },
    brand_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      required: false,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    images: {
      type: [String],
    },
    stock_quantity: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: false,
    },
    hotItems: {
      type: Boolean,
      required: true,
      default: false,
    },
    sku: {
      type: String,
      required: true,
    },
    dealOfTheMonth: {
      type: Boolean,
      required: true,
      default: false,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: { type: Number, required: true },
        comment: { type: String },
      },
    ],
    weight: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
