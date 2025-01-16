import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    product_variant: {
      type: {
        size: { type: Schema.Types.Mixed },
        color: { type: Schema.Types.Mixed },
      },
      default: null,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

cartSchema.virtual("id").get(function () {
  return this._id;
});

cartSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
