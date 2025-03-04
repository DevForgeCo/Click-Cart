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
    weight,
  } = req.body;

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
  res.status(200).json({
    status: 200,
    success: true,
    message: "Products fetched successfully",
    data: docs,
  });
});

const fetchProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid product ID.",
    });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product fetched successfully.",
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid product ID.",
    });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }

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
    weight,
  } = req.body;

  if (product_name) product.product_name = product_name;
  if (brand_name) product.brand_name = brand_name;
  if (price) product.price = price;
  if (discountedPrice) product.discountedPrice = discountedPrice;
  if (description) product.description = description;
  if (category) product.category = category;
  if (thumbnail) {
    if (!thumbnail.url) {
      return res.status(400).json({
        status: 400,
        message: "Thumbnail URL is required.",
      });
    }
    product.thumbnail = thumbnail;
  }
  if (images) {
    if (images.length !== 3) {
      return res.status(400).json({
        status: 400,
        message: "Exactly 3 image links are required.",
      });
    }
    product.images = images;
  }
  if (hotItems !== undefined) product.hotItems = hotItems;
  if (dealOfTheMonth !== undefined) product.dealOfTheMonth = dealOfTheMonth;
  if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
  if (sku) product.sku = sku;
  if (weight !== undefined) product.weight = weight;

  // Recalculate discountPercentage if price or discountedPrice is updated
  // if (price !== undefined || discountedPrice !== undefined) {
  //   const discountPercentage =
  //     ((product.price - product.discountedPrice) / product.price) * 100;
  //   product.discountPercentage = parseFloat(discountPercentage.toFixed(2));
  // }

  const updatedProduct = await product.save();

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product updated successfully.",
    data: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid product ID.",
    });
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found.",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Product deleted successfully.",
    data: product,
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      status: 400,
      message: "Search query is required.",
    });
  }

  const searchRegex = new RegExp(query, "i");

  const products = await Product.find({
    $or: [
      { product_name: { $regex: searchRegex } },
      { brand_name: { $regex: searchRegex } },
      { category: { $regex: searchRegex } },
    ],
  });

  if (products.length === 0) {
    return res.status(404).json({
      status: 404,
      message: "No products found matching your search.",
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Products fetched successfully.",
    data: products,
  });
});

export {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
