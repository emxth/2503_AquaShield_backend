import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import FEO from "../models/FEO.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is regular user or FEO
      if (decoded.userType === "feo") {
        req.user = await FEO.findById(decoded.id).select("-password");
        req.user.userType = "feo";
      } else {
        req.user = await User.findById(decoded.id).select("-password");
        req.user.userType = "user";
      }

      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error("Not authorized, user not found or inactive");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};
