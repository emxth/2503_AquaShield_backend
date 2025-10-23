import express from "express";
import {
  addfeo,
  allFEOs,
  loginAdmin,
  getAllUsers,
  getAllAccountDeletions,
  updateDeletionStatus,
  deleteUser,
  updateFEO,
  deleteFEO,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-feo", authAdmin, upload.single("image"), addfeo);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-feos", authAdmin, allFEOs);
adminRouter.get("/all-users", authAdmin, getAllUsers);
adminRouter.get("/all-deletions", authAdmin, getAllAccountDeletions);
adminRouter.put("/update-deletion-status", authAdmin, updateDeletionStatus);
adminRouter.delete("/delete-user/:id", authAdmin, deleteUser);
adminRouter.delete("/delete-feo/:id", authAdmin, deleteFEO);
adminRouter.put(
  "/update-feo/:id",
  authAdmin,
  upload.single("image"),
  updateFEO
);

export default adminRouter;
