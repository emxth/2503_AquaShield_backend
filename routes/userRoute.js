import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  requestAccountDeletion,
  checkDeletionRequest,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.put(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/request-delete", authUser, requestAccountDeletion);
userRouter.get("/check-deletion-request", authUser, checkDeletionRequest);
userRouter.post("/change-password", authUser, changePassword);

export default userRouter;
