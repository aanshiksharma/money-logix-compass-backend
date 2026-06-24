import React from "react";

const EMOTION_EMOJI = {
  neutral: "🙂",
  excited: "🤩",
  anxious: "😟",
  fearful: "😨",
  frustrated: "😤",
  hopeful: "🌱",
  confused: "🤔",
  panic: "🚨",
};

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const emo = msg.emotion;
  return (
    <div className={`bubble-row ${isUser ? "right" : "left"}`}>
      <div
        className={`bubble ${isUser ? "user" : "ai"} ${msg.panicMode ? "calm" : ""}`}
      >
        {!isUser && msg.panicMode && (
          <div className="calm-badge">🫶 Calm Mode · grounding response</div>
        )}
        <div className="bubble-text">{msg.content}</div>
        {!isUser && emo && emo.detected && (
          <div
            className="emo-tag"
            title={`confidence ${Math.round((emo.confidence || 0) * 100)}%`}
          >
            {EMOTION_EMOJI[emo.detected] || "•"} {emo.detected}
            {emo.triggeredBy && (
              <span className={`trig trig-${emo.triggeredBy}`}>
                {emo.triggeredBy === "safety-net"
                  ? "safety-net"
                  : emo.triggeredBy === "both"
                    ? "llm+safety-net"
                    : emo.triggeredBy}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
