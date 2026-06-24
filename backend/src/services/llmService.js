import OpenAI from "openai";
import { CALM_MODE_DIRECTIVE } from "../prompts/systemPrompts.js";

const apiKey = process.env.OPENROUTER_API_KEY;
const MOCK = process.env.MOCK_LLM === "true" || !apiKey;
const MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

let client = null;
if (!MOCK) {
  client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "NiveshMitra",
    },
  });
}

export function isMockMode() {
  return MOCK;
}

/**
 * Robustly extract the first JSON object from an LLM string.
 * Free models often wrap JSON in prose or ```json fences.
 */
export function safeParseJSON(raw) {
  if (!raw || typeof raw !== "string") return null;
  let text = raw.trim();
  // Strip code fences.
  text = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  // Direct parse.
  try {
    return JSON.parse(text);
  } catch (_) {
    /* fall through */
  }
  // Grab the outermost {...} block.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      /* give up */
    }
  }
  return null;
}

/**
 * Call the LLM with a system prompt + prior turns + current user message.
 * Returns parsed JSON (per system prompt contract) plus the raw text fallback.
 *
 * @param {Object}   opts
 * @param {string}   opts.systemPrompt
 * @param {Array}    opts.history          [{ role, content }]
 * @param {string}   opts.userMessage
 * @param {boolean}  opts.calmMode         append calm-mode directive
 */
export async function chatJSON({
  systemPrompt,
  history = [],
  userMessage,
  calmMode = false,
}) {
  const system = calmMode
    ? `${systemPrompt}\n\n${CALM_MODE_DIRECTIVE}`
    : systemPrompt;

  if (MOCK) {
    return mockResponse(userMessage, calmMode);
  }

  const messages = [
    { role: "system", content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 600,
      // Many OpenRouter models honor this; parser handles ones that don't.
      response_format: { type: "json_object" },
    });
    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSON(raw);
    if (parsed && parsed.response_text) {
      return { ...normalize(parsed), _raw: raw, _mock: false };
    }
    // Model didn't return valid JSON — degrade gracefully using raw text.
    return {
      response_text:
        raw ||
        "Sorry, I had trouble forming a reply. Could you say that again?",
      detected_emotion: "neutral",
      risk_signal: "none",
      confidence: 0.3,
      profile_updates: {},
      onboarding_complete: false,
      _raw: raw,
      _mock: false,
    };
  } catch (err) {
    console.error("LLM call failed:", err.message);
    return {
      ...mockResponse(userMessage, calmMode),
      response_text:
        "I'm having a little trouble reaching my brain right now — but I'm still here. Want to try again?",
      _error: err.message,
    };
  }
}

function normalize(p) {
  return {
    response_text: String(p.response_text || ""),
    detected_emotion: p.detected_emotion || "neutral",
    risk_signal: ["none", "low", "medium", "high"].includes(p.risk_signal)
      ? p.risk_signal
      : "none",
    confidence: typeof p.confidence === "number" ? p.confidence : 0.5,
    profile_updates: p.profile_updates || {},
    onboarding_complete: Boolean(p.onboarding_complete),
  };
}

/** Deterministic canned responses so the demo works without a key / network. */
function mockResponse(userMessage, calmMode) {
  if (calmMode) {
    return {
      response_text:
        "I hear you — that fear is completely valid. Take a breath. Markets dip; your plan was built for exactly these moments. Let's not act on panic. Can we look at your goals together before doing anything?",
      detected_emotion: "panic",
      risk_signal: "high",
      confidence: 0.9,
      profile_updates: {},
      onboarding_complete: false,
      _mock: true,
    };
  }
  return {
    response_text:
      "(mock) Thanks for sharing that! To tailor your plan, what's your biggest financial goal right now — and roughly how many years away is it?",
    detected_emotion: "neutral",
    risk_signal: "none",
    confidence: 0.6,
    profile_updates: {},
    onboarding_complete: false,
    _mock: true,
  };
}
