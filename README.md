# NiveshMitra 🪙

A conversational AI investment companion that **onboards users empathetically**, builds a
**personalized rule-based investment plan**, lets them **simulate sector allocations live**,
and detects **emotional distress / panic** to switch into a calmer, reassuring **Calm Mode**.

> ⚠️ **Not registered financial advice.** Educational hackathon project. No live trading.

---

## ✨ Core Features

1. **Accounts & sign-in** — email + password sign-in (demo gate keyed by email so chat
   history follows the account) **plus optional Google Sign-In (SSO)**. A short **basic-info
   form** (name, age, city, occupation, phone, monthly income, primary goal) is collected
   right after login and pre-fills the financial profile.
2. **Account-aware AI** — the assistant knows the signed-in user's name and basic details
   (and their live plan/dashboard numbers), so it greets them personally and never re-asks
   what the form already captured.
3. **Conversational onboarding** — remaining details (horizon, risk tolerance, etc.) are
   discovered through a natural, human-sounding chat (no forms) → structured risk profile.
4. **Personalized plan** — rule-based mapping of risk score → preset portfolio templates with
   real fund/stock names from a static dataset (no live market data).
5. **Interactive plan dashboard** — donut allocation chart, per-sector **return sliders** to
   simulate how monthly SIPs grow over time, milestones and projected corpus.
6. **Hybrid emotion / panic detection**
   - _Primary:_ LLM infers the user's emotional state through prompting.
   - _Safety net:_ a deterministic keyword/regex layer **force-triggers Calm Mode**
     regardless of the model output — guarantees the flagship feature works on demo day.
7. **Think mode** — a toggle that lets the assistant reason more deeply (longer, richer
   answers) when the user wants detail.
8. **Polished product experience** — a marketing landing page with a live wealth-projection
   chart, dashboard demo, sample conversation, personalization & trust sections, an FAQ, and
   an "always free" band — flowing into sign-in → basic-info → a **ChatGPT/Claude-style
   centered chat** (empty-state hero with suggestion chips) and a collapsible plan dashboard.
9. **Persistence** — accounts, conversations, risk profiles and plans are stored in
   **MongoDB Atlas**; the app gracefully falls back to in-memory storage if no DB is set.
10. **Dual theme** — Gemini-inspired **dark** (vivid blue→purple accents) and Claude-inspired
    **light**, toggleable and persisted.

## 🔑 User flow

```
Landing ─► Sign in (email + password  ·  or Google SSO) ─► Basic-info form ─► Chat
             session keyed by account        pre-fills profile      centered empty state,
             history follows the user        (name, income, goal)   then live conversation
```

## 🏗️ Architecture

```
React (Vite + recharts)  ──HTTP──►  Express API  ──►  Google Gemini (native REST)
   landing / login / SSO     │
   basic-info form           ├─► Google Sign-In token verify (google-auth-library)
   chat UI (centered)        ├─► MongoDB Atlas (User, ConversationLog, RiskProfile, Plan)
   plan dashboard + sliders  ├─► Emotion safety-net (deterministic keywords)
   calm-mode cue             ├─► Risk scoring engine
   dark / light themes       └─► Rule-based portfolio templates (static JSON)
```

### Why hybrid emotion detection?

LLMs are excellent at inferring emotion through prompting, but pure LLM output isn't
reliable enough for a live demo. We layer a **deterministic keyword/regex safety net**
on top of LLM-based inference so Calm Mode **always** triggers on clear distress signals
("sell everything", "I can't sleep", "lost it all"), no matter how the model phrases things.

---

## 🚀 Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # add your GEMINI_API_KEY (+ optional MONGODB_URI)
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

### Getting a free Gemini key (recommended)

1. Get a free key at https://aistudio.google.com/apikey
2. Put it in `backend/.env` as `GEMINI_API_KEY` (`LLM_PROVIDER=gemini`).
3. Default model is `gemini-2.5-flash` with automatic fallbacks if it's overloaded.

> No key yet? The backend runs in **MOCK_LLM mode** automatically and returns canned
> structured responses so the full flow (and demo video) still works.

### Database (MongoDB Atlas)

Set `MONGODB_URI` in `backend/.env` to a MongoDB Atlas connection string to persist
accounts, conversations, profiles and plans. Without it the app still runs using an
in-memory store (data resets on restart).

> On networks where Node's DNS can't resolve the `mongodb+srv://` SRV record, use the
> non-SRV (direct-host) Atlas connection string instead — it's functionally identical.

### Google Sign-In (optional SSO)

1. Create an **OAuth 2.0 Web client ID** at https://console.cloud.google.com/apis/credentials
   with `http://localhost:5173` as an **Authorized JavaScript origin**.
2. Put the **same** client ID in both:
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`
3. Restart both servers. The Google button appears automatically; leave the values blank to
   hide it and use email + password only.

---

## 📂 Project layout

```
NiveshMitra/
├── backend/         Express + Mongoose + Gemini (native REST)
│   └── src/
│       ├── config/      db connection
│       ├── models/      Mongoose schemas (User incl. account + basic info)
│       ├── services/    llm, emotion, risk, plan, store (identity helpers)
│       ├── prompts/     system prompts
│       ├── data/        static fund/portfolio dataset
│       └── routes/      auth (login / google / basic-info) / chat / profile / plan
└── frontend/        Vite + React
    └── src/
        ├── Root.jsx        theme + auth + view orchestration (landing/login/basic-info/chat)
        ├── App.jsx         chat experience (centered empty state)
        ├── api/            backend client
        └── components/     Landing, Login, BasicInfo, MessageBubble, PlanDashboard
```

## 🛡️ Guardrails

- Disclaimer injected into every plan response.
- Prompt-injection resistance: user text is never concatenated into the system prompt;
  system instructions are pinned and the model is told to ignore instructions in user content.
- Deterministic panic safety-net cannot be talked out of by the user.
- Google ID tokens are verified server-side with `google-auth-library`.

> ℹ️ **Demo auth note:** email + password login is a lightweight gate — any password is
> accepted and passwords are not stored. It identifies accounts by email for the demo, not
> for real security. Swap in hashed passwords (e.g. bcrypt) for production use.

## 🎤 Pitch hooks (mapped to rubric)

- **Conversational AI:** multi-turn, human-sounding empathetic onboarding with persisted state.
- **Accounts & personalization:** email/password + Google SSO, a basic-info form, and an
  account-aware assistant that greets users by name and reuses their details.
- **Emotion detection:** LLM inference + deterministic safety layer.
- **Prompt design:** structured system prompts with robust parsing; optional Think mode.
- **Behavioral finance logic:** risk scoring → portfolio templates → interactive simulation → milestones.
- **Product polish:** landing page, theming, ChatGPT-style centered chat, collapsible dashboard with live sliders.
- **Safety:** disclaimers, injection resistance, guaranteed Calm Mode trigger.
