# NiveshMitra 🪙

A conversational AI investment companion that **onboards users empathetically**, builds a
**personalized rule-based investment plan**, and detects **emotional distress / panic** to
switch into a calmer, reassuring "Calm Mode."

> ⚠️ **Not registered financial advice.** Educational hackathon project. No live trading.

---

## ✨ Core Features (MVP)

1. **Conversational onboarding** — goals, horizon, income, fear tolerance → structured risk profile.
2. **Personalized plan** — rule-based mapping of risk score → preset portfolio templates
   (real fund/stock names from a static dataset, no live market data).
3. **Hybrid emotion / panic detection**
   - _Primary:_ LLM returns structured JSON `{ response_text, detected_emotion, risk_signal, confidence }`.
   - _Safety net:_ deterministic keyword/regex layer that **force-triggers panic mode**
     regardless of the model output — guarantees the flagship feature works on demo day.
4. **Milestone tracking + periodic check-ins.**

## 🏗️ Architecture

```
React (Vite)  ──HTTP──►  Express API  ──►  OpenRouter (free LLM)
   chat UI                  │
   dashboard                ├─► MongoDB (User, ConversationLog, RiskProfile, Plan)
   calm-mode cue            ├─► Emotion safety-net (deterministic keywords)
                            ├─► Risk scoring engine
                            └─► Rule-based portfolio templates (static JSON)
```

### Why hybrid emotion detection?

LLMs are excellent at inferring emotion through prompting, but pure LLM output isn't
reliable enough for a live demo. We layer a **deterministic keyword/regex safety net**
on top of LLM-based inference so panic mode **always** triggers on clear distress signals
("sell everything", "I can't sleep", "lost it all"), no matter how the model phrases things.

---

## 🚀 Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # add your OPENROUTER_API_KEY + MONGODB_URI
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 and proxies `/api` to the backend on http://localhost:5000.

### Getting a free OpenRouter key

1. Sign up at https://openrouter.ai
2. Create a key under **Keys**.
3. Put it in `backend/.env` as `OPENROUTER_API_KEY`.
4. Default model is a free one (`OPENROUTER_MODEL`) — see `.env.example`.

> No key yet? The backend runs in **MOCK_LLM mode** automatically and returns canned
> structured responses so the full flow (and demo video) still works.

---

## 📂 Project layout

```
NiveshMitra/
├── backend/         Express + Mongoose + OpenRouter
│   └── src/
│       ├── config/      db connection
│       ├── models/      Mongoose schemas
│       ├── services/    llm, emotion, risk, plan
│       ├── prompts/     system prompts
│       ├── data/        static fund/portfolio dataset
│       └── routes/      chat / profile / plan
└── frontend/        Vite + React chat UI + dashboard
```

## 🛡️ Guardrails

- Disclaimer injected into every plan response.
- Prompt-injection resistance: user text is never concatenated into the system prompt;
  system instructions are pinned and the model is told to ignore instructions in user content.
- Deterministic panic safety-net cannot be talked out of by the user.

## 🎤 Pitch hooks (mapped to rubric)

- **Conversational AI:** multi-turn empathetic onboarding with persisted state.
- **Emotion detection:** LLM JSON inference + deterministic safety layer.
- **Prompt design:** structured JSON-mode system prompt, robust parsing.
- **Behavioral finance logic:** risk scoring → portfolio templates → milestones.
- **Safety:** disclaimers, injection resistance, guaranteed panic trigger.
