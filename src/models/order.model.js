import mongoose, { Schema } from "mongoose";

// Only one allowed payment method: Cash on Delivery
const paymentMethods = {
  values: ["Cash on Delivery"],
  message: "enum validator failed for payment methods",
};

const orderStatuses = {
  values: [
    "placed",
    "processing",
    "shipping",
    "delivered",
    "pending",
    "completed",
  ],
  message: "enum validator failed for order status",
};

const paymentStatuses = {
  values: ["paid", "not paid", "pending"],
  message: "enum validator failed for payment status",
};

const orderSchema = new Schema(
  {
    order_number: { type: String, required: true, unique: true },
    items: { type: [Schema.Types.Mixed], required: true },
    // user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: String, required: true },
    total_amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    gross_amount: { type: Number, required: true },
    shipping_amount: { type: Number, default: 0 },
    net_amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: paymentMethods,
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: paymentStatuses,
      default: "pending",
    },
    status: {
      type: String,
      required: true,
      enum: orderStatuses,
      default: "pending",
    },
    selectedAddress: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

orderSchema.virtual("id").get(function () {
  return this._id;
});

orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
