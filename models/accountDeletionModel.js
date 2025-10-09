import mongoose from "mongoose";

const accountDeletionSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Pending | Accepted | Rejected
  requestedDate: { type: Date, default: Date.now } // ✅ renamed
});

export default mongoose.model("accountDeletion", accountDeletionSchema);
