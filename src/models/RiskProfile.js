import mongoose from "mongoose";

const riskProfileSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    // Captured progressively across the onboarding conversation.
    goals: { type: [String], default: [] },
    horizonYears: { type: Number, default: null },
    monthlyIncome: { type: Number, default: null },
    monthlyInvestable: { type: Number, default: null },
    fearTolerance: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },
    lifeStage: { type: String, default: null },
    // 0-100 computed risk score.
    riskScore: { type: Number, default: null },
    riskCategory: { type: String, default: null },
    complete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("RiskProfile", riskProfileSchema);
