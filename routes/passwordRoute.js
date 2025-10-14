import express from "express";
import { sendOTP, verifyOTP, resetPassword } from "../controllers/passwordController.js";

const passwordRouter = express.Router();

passwordRouter.post("/forgot-password", sendOTP);
passwordRouter.post("/verify-otp", verifyOTP);
passwordRouter.post("/reset-password", resetPassword);

export default passwordRouter;
