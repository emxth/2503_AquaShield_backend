import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const feoSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: ["Marine Police", "Coastal Surveillance", "Fisheries Department"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    assignedArea: {
      type: String,
      required: [true, "Assigned area is required"],
      trim: true,
    },
    nicNo: {
      type: String,
      required: [true, "NIC number is required"],
      unique: true,
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
    officeContact: {
      type: String,
      required: [true, "Office contact is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    // UPDATED: profileImage now supports both Cloudinary and Base64
    profileImage: {
      url: String, // For Cloudinary URL (KEPT FOR REFERENCE)
      publicId: String, // For Cloudinary public ID (KEPT FOR REFERENCE)
      base64: String, // NEW: For Base64 encoded image
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
feoSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
feoSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
feoSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const FEO = mongoose.model("FEO", feoSchema);

export default FEO;
