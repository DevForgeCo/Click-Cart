import Product from "../models/product.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  try {
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
      !description ||
      !category ||
      !thumbnail ||
      !images
    ) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields. Thumbnail and images are required.",
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Price must be a positive number." });
    }

    if (discountedPrice && typeof discountedPrice !== "number") {
      return res
        .status(400)
        .json({ status: 400, message: "Discounted price must be a number." });
    }

    if (stock_quantity && typeof stock_quantity !== "number") {
      return res
        .status(400)
        .json({ status: 400, message: "Stock quantity must be a number." });
    }

    if (weight && typeof weight !== "number") {
      return res
        .status(400)
        .json({ status: 400, message: "Weight must be a number." });
    }

    const discountPercentage = discountedPrice
      ? ((price - discountedPrice) / price) * 100
      : 0;

    const newProduct = new Product({
      product_name,
      brand_name,
      price: parseFloat(price.toFixed(2)),
      discountedPrice: discountedPrice
        ? parseFloat(discountedPrice.toFixed(2))
        : undefined,
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
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const fetchAllProductsByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, query } = req.query;

    if (query) {
      const searchRegex = new RegExp(query, "i");
      const searchFilter = {
        $or: [
          { product_name: { $regex: searchRegex } },
          { brand_name: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
        ],
      };

      const products = await Product.find(searchFilter).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Search results fetched successfully.",
        data: products,
        totalResults: products.length,
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find()
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      message: "All products fetched with pagination.",
      data: products,
      pagination: {
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const fetchAllProductsByClient = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find().limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

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
  fetchAllProductsByAdmin,
  fetchProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  fetchAllProductsByClient,
};
