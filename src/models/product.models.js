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
    url_slug: {
      type: String,
      unique: true,
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
