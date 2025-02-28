import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import apiError from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const {
    product_name,
    brand_name,
    price,
    discountedPrice,
    description,
    category,
    thumbnail,
    images,
    hotItems,
    dealOfTheMonth,
    stock_quantity,
    sku,
    inStoke,
    weight,
  } = req.body;

  console.log("Request Body:", req.body);

  if (
    !product_name ||
    !brand_name ||
    !price ||
    !discountedPrice ||
    !description ||
    !category ||
    !thumbnail ||
    !images ||
    images.length !== 3
  ) {
    return res.status(400).json({
      status: 400,
      message:
        "Missing required fields. Thumbnail and exactly 3 image links are required.",
    });
  }

  if (stock_quantity && typeof stock_quantity !== "number") {
    return res.status(400).json({
      status: 400,
      message: "stock_quantity must be a number.",
    });
  }

  if (weight && typeof weight !== "number") {
    return res.status(400).json({
      status: 400,
      message: "weight must be a number.",
    });
  }

  const discountPercentage = ((price - discountedPrice) / price) * 100;

  const newProduct = new Product({
    product_name,
    brand_name,
    price: parseFloat(price).toFixed(2),
    discountedPrice: parseFloat(discountedPrice).toFixed(2),
    description,
    category,
    thumbnail,
    images,
    hotItems: hotItems || false,
    dealOfTheMonth: dealOfTheMonth || false,
    stock_quantity: stock_quantity || 0,
    sku: sku || "",
    inStoke: inStoke || false,
    weight: weight || 0,
    discountPercentage: parseFloat(discountPercentage.toFixed(2)),
  });

  const createdProduct = await newProduct.save();

  res.status(201).json({
    status: 201,
    success: true,
    message: "Product created successfully",
    data: createdProduct,
  });
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  const condition = !req.query.admin ? { deleted: { $ne: true } } : {};
  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  if (req.query.category) {
    const categories = req.query.category.split(",");
    query = query.find({ category: { $in: categories } });
    totalProductsQuery = totalProductsQuery.find({
      category: { $in: categories },
    });
  }

  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  const totalDocs = await totalProductsQuery.countDocuments().exec();
  if (req.query._page && req.query._limit) {
    const pageSize = parseInt(req.query._limit, 10);
    const page = parseInt(req.query._page, 10);
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  const docs = await query.exec();
  res.set("X-Total-Count", totalDocs);
  res
    .status(200)
    .json(new ApiResponse(200, docs, "Products fetched successfully"));
});

const fetchProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new apiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully."));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new apiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found.");
  }

  const { product_name, price, description, category, thumbnail, images } =
    req.body;

  if (product_name) product.product_name = product_name;
  if (price) product.price = price;
  if (description) product.description = description;
  if (category) product.category = category;
  if (thumbnail) {
    if (!thumbnail.url) {
      throw new apiError(400, "Thumbnail URL is required.");
    }
    product.thumbnail = thumbnail;
  }
  if (images) {
    if (images.length !== 3) {
      throw new apiError(400, "Exactly 3 image links are required.");
    }
    product.images = images;
  }

  const updatedProduct = await product.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedProduct, "Product updated successfully.")
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new apiError(400, "Invalid product ID.");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new apiError(404, "Product not found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully."));
});

export {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
};
