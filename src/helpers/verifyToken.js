import jwt from "jsonwebtoken";
import apiError from "../utils/apiErrors.js";

// Utility function to verify JWT token
const verifyToken = (token) => {
  try {
    // Verify the token using the secret key (ensure this matches how you sign the token)
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return decoded; // This will return the decoded payload, typically including the userId
  } catch (error) {
    // Handle token verification errors
    throw new apiError(401, "Invalid or expired token");
  }
};

export default verifyToken;
