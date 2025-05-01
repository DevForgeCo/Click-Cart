import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

// app.use(cors());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: false,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Router Import
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import wishlist from "./models/wishList.models.js";
import orderRoutes from "./routes/order.routes.js";
import userManagementRoutes from "./routes/userManagement.routes.js";
import adminRoutes from "./routes/adminRoutes/admin.routes.js";
import bannerRoutes from "./routes/adminRoutes/banner.routes.js";

// Route Declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v2/products", productRoutes);
app.use("/api/v3/cart", cartRoutes);
app.use("/api/v4/reviews", reviewsRoutes);
app.use("/api/v5/wishList", wishlist);
app.use("/api/v6/order", orderRoutes);
app.use("/api/v7/userManagement", userManagementRoutes);
app.use("/api/v8/admin-authentication", adminRoutes);
app.use("/api/v9/admin/banner-image", bannerRoutes);

export default app;
