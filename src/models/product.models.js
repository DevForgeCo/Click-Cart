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
    url_slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 255,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
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
    discountPercentage: {
      type: Number,
      min: [1, "Minimum discount is 1%"],
      max: [99, "Maximum discount is 99%"],
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    rating: {
      type: Number,
      min: [0, "Minimum rating is 0"],
      max: [5, "Maximum rating is 5"],
      default: 0,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    brand: {
      type: String,
      required: true,
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    colors: {
      type: [Schema.Types.Mixed],
    },
    sizes: {
      type: [Schema.Types.Mixed],
    },
    highlights: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Virtual to return id instead of _id
productSchema.virtual("id").get(function () {
  return this._id;
});

// Pre-save hook to calculate discountPrice
productSchema.pre("save", function (next) {
  if (this.discountPercentage) {
    this.discountPrice =
      this.price - (this.price * this.discountPercentage) / 100;
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
