// Discount Schema (discount.js)
const mongoose = require("mongoose");
const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Optional: apply discount to specific products
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Discount", discountSchema);
