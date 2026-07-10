// Thin data-access layer. Uses Mongoose models when MongoDB is connected,
// otherwise falls back to in-memory maps so the demo never hard-fails.
import crypto from "crypto";
import { isDbConnected } from "../config/db.js";
import { generateConversationTitle } from "../services/llmService.js";
import ConversationLog from "../models/ConversationLog.js";
import RiskProfile from "../models/RiskProfile.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";

export function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = crypto.randomBytes(2).toString("hex");

  return `${baseSlug}-${suffix}`;
}

const mem = {
  conversations: new Map(),
  profiles: new Map(),
  plans: new Map(),
  users: new Map(),
};

// ---- Users ----
export async function getUser(email) {
  if (isDbConnected()) {
    try {
      let user = await User.findOne({ email });
      return user;
    } catch (err) {
      return console.error("Error fetching user:", err);
    }
  }
}

// Upsert identity fields (name/email/googleId/picture) for a session.
// Only overwrites fields that are actually provided and non-empty.
export async function setUserIdentity(email, info = {}) {
  const fields = {};
  for (const k of [
    "name",
    "image",
    "age",
    "city",
    "occupation",
    "phone",
    "basicInfoComplete",
  ]) {
    if (info[k] != null && info[k] !== "") fields[k] = info[k];
  }
  if (isDbConnected()) {
    return User.findOneAndUpdate(
      { email },
      { $set: fields },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

// ---- Conversations ----
export async function getConversation(conversationId) {
  if (isDbConnected()) {
    const conversation = await ConversationLog.findOne({
      _id: conversationId,
    });

    return conversation;
  }
}

export async function createConversation(email, message) {
  const user = await getUser(email);
  if (!user) return;

  const title = (await generateConversationTitle(message)) || "New Chat";
  const slug = generateSlug(title);

  const conversation = await ConversationLog.create({
    userId: user._id,
    slug,
    title,
    messages: [],
  });

  const messageAppendedConversation = await appendMessages(
    conversation._id.toString(),
    [{ role: "user", content: message }],
  );

  return messageAppendedConversation;
}

export async function getAllConversations() {
  if (isDbConnected()) {
    const conversationLogs = await ConversationLog.find();
    return JSON.parse(JSON.stringify(conversationLogs));
  }
}

export async function appendMessages(conversationId, newMessages) {
  const conversation = await getConversation(conversationId);
  conversation.messages.push(...newMessages);
  if (isDbConnected()) await conversation.save();
  return conversation;
}

// ---- Risk profile ----
export async function getProfile(conversationId) {
  if (isDbConnected()) {
    let profile = await RiskProfile.findOne({ conversationId });
    if (!profile) {
      profile = await RiskProfile.create({ conversationId });

      const user = await getUser();

      // Feed overlapping fields into the financial risk profile.
      // const updates = {};
      // const incomeNum = Number(income);
      // if (!Number.isNaN(incomeNum) && incomeNum > 0) {
      //   updates.monthlyIncome = incomeNum;
      // }
      // const goalClean = clean(goal);
      // if (goalClean) updates.goals = [goalClean];
      // if (Object.keys(updates).length)
      //   await updateProfile(conversationId, updates);
    }

    return profile;
  }
}

export async function updateProfile(conversationId, updates) {
  const profile = await getProfile(conversationId);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) continue;
    if (key === "goals" && Array.isArray(value)) {
      const set = new Set([...(profile.goals || []), ...value]);
      profile.goals = [...set];
    } else {
      profile[key] = value;
    }
  }
  if (isDbConnected()) await profile.save();
  return profile;
}

// ---- Plan ----
export async function savePlan(conversationId, planData) {
  if (isDbConnected()) {
    return Plan.findOneAndUpdate({ conversationId }, planData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  return planData;
}

export async function getPlan(conversationId) {
  if (isDbConnected()) return Plan.findOne({ conversationId });
}
