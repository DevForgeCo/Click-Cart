import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import apiError from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createProduct = asyncHandler(async (req, res) => {
  const {
    product_name,
    description,
    price,
    discountPercentage,
    stock_quantity,
    images,
  } = req.body;

  if (
    !product_name ||
    !description ||
    !price ||
    stock_quantity === undefined ||
    !images ||
    images.length === 0
  ) {
    return res.status(400).json({
      status: 400,
      message: "Missing required fields",
    });
  }

  if (
    discountPercentage &&
    (discountPercentage < 1 || discountPercentage > 99)
  ) {
    return res.status(400).json({
      status: 400,
      message: "Discount percentage must be between 1 and 99",
    });
  }

  let discountPrice = null;
  if (discountPercentage) {
    discountPrice = (price * (1 - discountPercentage / 100)).toFixed(2);
  }

  const newProduct = new Product({
    product_name,
    description,
    price: parseFloat(price).toFixed(2),
    discountPercentage: discountPercentage || 0,
    discountPrice: discountPrice || null,
    stock_quantity,
    images: images.map((url) => ({ url })),
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
    query = query.find({ category_id: { $in: categories } });
    totalProductsQuery = totalProductsQuery.find({
      category_id: { $in: categories },
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

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }

  const {
    product_name,
    description,
    price,
    discountPercentage,
    stock_quantity,
    images,
  } = req.body;

  if (product_name) product.product_name = product_name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (discountPercentage) product.discountPercentage = discountPercentage;
  if (stock_quantity) product.stock_quantity = stock_quantity;
  if (images) product.images = images.map((url) => ({ url }));

  if (discountPercentage) {
    product.discountPrice = parseFloat(
      (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    );
  }

  const updatedProduct = await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(
    id,
    { deleted: true },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully"));
});

export {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
};
