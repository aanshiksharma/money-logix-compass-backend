import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Friend" },
    // Anonymous session id from the frontend so we can demo without auth.
    sessionId: { type: String, required: true, unique: true, index: true },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
