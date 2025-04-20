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
      // validate: {
      //   validator: function (images) {
      //     return images.length === 3;
      //   },
      //   message: "Exactly 3 image links are required.",
      // },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    weight: {
      type: Number, // Changed from String to Number
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: false, // Changed to false since it's calculated dynamically
    },
    url_slug: {
      type: String,
      unique: true, // Ensure uniqueness
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

productSchema.virtual("id").get(function () {
  return this._id;
});

productSchema.pre("save", function (next) {
  if (this.images.length !== 3) {
    return next(new Error("Exactly 3 image links are required."));
  }

  // Generate URL slug if not provided
  if (!this.url_slug) {
    this.url_slug = this.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace special characters with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  next();
});

productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
