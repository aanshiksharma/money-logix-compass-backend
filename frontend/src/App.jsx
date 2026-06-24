import React, { useEffect, useRef, useState } from "react";
import { api, getSessionId, resetSession } from "./api/client.js";
import MessageBubble from "./components/MessageBubble.jsx";
import PlanDashboard from "./components/PlanDashboard.jsx";

const GREETING = {
  role: "assistant",
  content:
    "Hi, I'm NiveshMitra 🪙 — think of me as a friend who happens to know about money. " +
    "No jargon, no judgement. To start: what are you hoping to achieve with your money, " +
    "and is there a goal that matters most right now?",
  emotion: { detected: "hopeful", confidence: 0.6 },
};

export default function App() {
  const [sessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [banner, setBanner] = useState(null);
  const [mock, setMock] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .health()
      .then((h) => setMock(h.mockLLM))
      .catch(() => {});
    api
      .getProfile(sessionId)
      .then((r) => setProfile(r.profile))
      .catch(() => {});
    api
      .getPlan(sessionId)
      .then((r) => setPlan(r.plan))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    setBanner(null);
    try {
      const res = await api.sendMessage(sessionId, text);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.reply,
          panicMode: res.emotion?.panicMode,
          emotion: {
            detected: res.emotion?.detected,
            confidence: res.emotion?.confidence,
            triggeredBy: res.emotion?.triggeredBy,
          },
        },
      ]);
      setProfile(res.profile);
      if (res.emotion?.panicMode) {
        setBanner({
          type: "calm",
          text: "💛 We noticed you might be stressed. Take a breath — let's not make rushed money decisions.",
        });
      } else if (res.emotion?.fomo) {
        setBanner({
          type: "fomo",
          text: "⚠️ Sounds like excitement! Quick reminder: chasing hype rarely beats a steady plan.",
        });
      } else if (res.checkIn) {
        setBanner({
          type: "checkin",
          text: "🔔 Periodic check-in: how are you feeling about your progress so far?",
        });
      }
      if (res.planBuilt || res.phase === "advisor") {
        const p = await api.getPlan(sessionId).catch(() => null);
        if (p?.plan) setPlan(p.plan);
        if (res.planBuilt) {
          setBanner({
            type: "success",
            text: "🎉 Your personalized plan is ready — see the dashboard!",
          });
        }
      }
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function startOver() {
    resetSession();
    window.location.reload();
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">🪙</span>
          <div>
            <h1>NiveshMitra</h1>
            <small>your empathetic money companion</small>
          </div>
        </div>
        <div className="topbar-right">
          {mock && <span className="mock-pill">MOCK LLM</span>}
          <button className="ghost" onClick={startOver}>
            Start over
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="chat-panel">
          {banner && (
            <div className={`banner ${banner.type}`}>{banner.text}</div>
          )}
          <div className="messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="bubble-row left">
                <div className="bubble ai typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <div className="composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Tell me about your goals, or how you're feeling about the market…"
              rows={1}
            />
            <button onClick={send} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
          <p className="foot-note">
            Educational only · not registered financial advice. Try: “the market
            is crashing, should I sell everything?”
          </p>
        </section>

        <aside className="dash-panel">
          <PlanDashboard plan={plan} profile={profile} />
        </aside>
      </main>
    </div>
  );
}
