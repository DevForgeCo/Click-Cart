import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModels/admin.models.js";
import apiError from "../utils/apiErrors.js";

const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new apiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!admin || admin.role !== "admin") {
      throw new apiError(403, "Forbidden: Admin access only");
    }

    req.admin = admin; 
    next();
  } catch (error) {
    next(error);
  }
};

export default isAdmin;
