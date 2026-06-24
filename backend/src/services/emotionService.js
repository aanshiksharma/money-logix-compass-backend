// Deterministic emotion / panic safety-net.
// This layer runs INDEPENDENTLY of the LLM. If clear distress language appears,
// panic mode is force-triggered no matter what the model returns. This guarantees
// the flagship feature works on demo day.

const PANIC_PATTERNS = [
  /\bsell (everything|it all|all of it|now)\b/i,
  /\bpull (out|everything)\b/i,
  /\bwithdraw everything\b/i,
  /\bi('?m| am) panicking\b/i,
  /\bi('?m| am) freaking out\b/i,
  /\blost it all\b/i,
  /\blost everything\b/i,
  /\blosing everything\b/i,
  /\bcan'?t sleep\b/i,
  /\bcan'?t take (it|this)( anymore)?\b/i,
  /\bmarket('?s| is) crash/i,
  /\bcrashing\b/i,
  /\bi('?m| am) scared\b/i,
  /\bi('?m| am) terrified\b/i,
  /\beverything is gone\b/i,
  /\bruined\b/i,
  /\bget me out\b/i,
];

const FOMO_PATTERNS = [
  /\ball in\b/i,
  /\bput everything (in|into)\b/i,
  /\bbefore it'?s too late\b/i,
  /\bguaranteed (returns?|profit)\b/i,
  /\bcan'?t miss\b/i,
  /\bto the moon\b/i,
  /\beveryone is buying\b/i,
  /\bdouble my money\b/i,
];

/**
 * @param {string} text user message
 * @returns {{ panic: boolean, fomo: boolean, matched: string[] }}
 */
export function scanEmotionSafetyNet(text) {
  if (!text || typeof text !== "string") {
    return { panic: false, fomo: false, matched: [] };
  }
  const matched = [];
  let panic = false;
  let fomo = false;

  for (const re of PANIC_PATTERNS) {
    if (re.test(text)) {
      panic = true;
      matched.push(re.source);
    }
  }
  for (const re of FOMO_PATTERNS) {
    if (re.test(text)) {
      fomo = true;
      matched.push(re.source);
    }
  }
  return { panic, fomo, matched };
}

/**
 * Combine the deterministic scan with the LLM's own judgement.
 * @param {string} userText
 * @param {object} llmResult  parsed LLM output
 */
export function resolvePanic(userText, llmResult) {
  const net = scanEmotionSafetyNet(userText);
  const llmPanic =
    llmResult?.detected_emotion === "panic" ||
    llmResult?.risk_signal === "high";

  const panicMode = net.panic || llmPanic;
  let triggeredBy = null;
  if (net.panic && llmPanic) triggeredBy = "both";
  else if (net.panic) triggeredBy = "safety-net";
  else if (llmPanic) triggeredBy = "llm";

  return {
    panicMode,
    fomo: net.fomo,
    triggeredBy,
    matched: net.matched,
  };
}
