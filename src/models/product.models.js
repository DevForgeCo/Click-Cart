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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
        },
      ],
      validate: {
        validator: function (images) {
          return images.length === 3;
        },
        message: "Exactly 3 image links are required.",
      },
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
