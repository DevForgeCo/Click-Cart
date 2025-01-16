import Product from "../models/product.models.js";
import Category from "../models/category.models.js";
import apiError from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

const createProduct = asyncHandler(async (req, res) => {
  const {
    product_name,
    url_slug,
    category_name,
    sku,
    description,
    price,
    discountPercentage,
    stock_quantity,
    brand,
    colors,
    sizes,
    highlights,
  } = req.body;

  const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
  const imagesFiles = req.files.images || [];

  if (
    !product_name ||
    !url_slug ||
    !category_name ||
    !sku ||
    !description ||
    !price ||
    !brand ||
    !thumbnailFile ||
    imagesFiles.length === 0 ||
    stock_quantity === undefined
  ) {
    return res.status(400).json({
      status: 400,
      message: "Missing required fields",
    });
  }

  let category = await Category.findOne({ category_name });
  if (!category) {
    category = new Category({
      category_name,
      url_slug: category_name.toLowerCase().replace(/ /g, "-"),
    });
    await category.save();
  }

  const category_id = category._id;

  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return res.status(400).json({
      status: 400,
      message: `Product with SKU ${sku} already exists`,
    });
  }

  let discountPrice = null;
  if (discountPercentage) {
    if (discountPercentage < 1 || discountPercentage > 99) {
      return res.status(400).json({
        status: 400,
        message: "Discount percentage must be between 1 and 99",
      });
    }
    discountPrice = (price * (1 - discountPercentage / 100)).toFixed(2);
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnailFile.path);
  if (!thumbnailUrl) {
    return res.status(400).json({
      status: 400,
      message: "Failed to upload thumbnail",
    });
  }

  const imageUrls = [];
  for (const imageFile of imagesFiles) {
    const uploadedImage = await uploadOnCloudinary(imageFile.path);
    if (uploadedImage) {
      imageUrls.push({
        url: uploadedImage.url,
        public_id: uploadedImage.public_id,
      });
    }
  }

  const newProduct = new Product({
    product_name,
    url_slug,
    category_id,
    sku,
    description,
    price: parseFloat(price).toFixed(3),
    discountPercentage: discountPercentage || 0,
    discountPrice: discountPrice || null,
    stock_quantity,
    brand,
    thumbnail: {
      url: thumbnailUrl.url,
      public_id: thumbnailUrl.public_id,
    },
    images: imageUrls,
    colors: colors || [],
    sizes: sizes || [],
    highlights: highlights || [],
  });

  const createdProduct = await newProduct.save();

  res
    .status(201)
    .json(new ApiResponse(201, createdProduct, "Product created successfully"));
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

  if (req.query.brand) {
    const brands = req.query.brand.split(",");
    query = query.find({ brand: { $in: brands } });
    totalProductsQuery = totalProductsQuery.find({ brand: { $in: brands } });
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

  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) {
    return res.status(404).json({
      status: 404,
      message: "Product not found",
    });
  }

  if (req.body.thumbnail) {
    product.thumbnail = await uploadToCloudinary(req.body.thumbnail);
  }
  if (req.body.images) {
    product.images = await Promise.all(
      req.body.images.map(async (image) => await uploadToCloudinary(image))
    );
  }

  Object.assign(product, req.body);

  if (product.discountPercentage) {
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
