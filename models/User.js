import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true, // CHANGE FROM conditional to always required
      minlength: [8, "Password must be at least 8 characters"],
    },
    contactNo: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      url: String,
      publicId: String,
      base64: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // UPDATED: Enhanced account deletion request fields
    deletionRequested: {
      type: Boolean,
      default: false,
    },
    deletionRequestedAt: Date,
    deletionReason: String,
    // NEW: Deletion status tracking
    deletionRequestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
    },
    deletionProcessedAt: Date,
    deletionProcessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
