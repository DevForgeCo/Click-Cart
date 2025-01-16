import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    category_name: { type: String, required: true, unique: true, trim: true },
    url_slug: { type: String, required: true, unique: true, trim: true },
    parent_cat_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.virtual("id").get(function () {
  return this._id;
});

categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
