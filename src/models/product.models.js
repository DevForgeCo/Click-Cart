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
    discountPercentage: {
      type: Number,
      min: [1, "Minimum discount is 1%"],
      max: [99, "Maximum discount is 99%"],
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

productSchema.virtual("id").get(function () {
  return this._id;
});

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
