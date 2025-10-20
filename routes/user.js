import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  requestAccountDeletion,
  cancelDeletionRequest,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`📝 User route: ${req.method} ${req.path}`);
  console.log(`📝 Content-Type: ${req.headers["content-type"]}`);
  next();
});

// Profile routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    (req, res, next) => {
      console.log("📄 Processing PUT /profile request (BASE64)");
      console.log("📄 Body keys:", Object.keys(req.body));
      next();
    },
    updateUserProfile
  )
  .delete(protect, deleteUserAccount);

// Password change route
router.put("/change-password", protect, changePassword);

// NEW: Account deletion request routes
router.post("/request-deletion", protect, requestAccountDeletion);
router.delete("/cancel-deletion-request", protect, cancelDeletionRequest);

export default router;
