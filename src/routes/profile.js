import express from "express";
import { getProfile, getConversation } from "../services/store.js";

const router = express.Router();

// GET /api/profile/:sessionId
router.get("/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const p = await getProfile(conversationId);
    res.json({
      profile: {
        goals: p.goals || [],
        horizonYears: p.horizonYears ?? null,
        monthlyIncome: p.monthlyIncome ?? null,
        monthlyInvestable: p.monthlyInvestable ?? null,
        fearTolerance: p.fearTolerance ?? null,
        lifeStage: p.lifeStage ?? null,
        riskScore: p.riskScore ?? null,
        riskCategory: p.riskCategory ?? null,
        complete: Boolean(p.complete),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not load profile." });
  }
});

// GET /api/profile/:sessionId/history -> full conversation log
router.get("/:conversationId/history", async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    const convo = await getConversation(conversationId);
    res.json({ messages: convo.messages || [] });
  } catch (err) {
    res.status(500).json({ error: "Could not load history." });
  }
});

export default router;
