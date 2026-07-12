# NiveshMitra Backend — Flow Diagrams 🪙

A simple visual guide to how the backend works. Share this with the team.

> The frontend (browser) just sends messages to the backend and shows back what it
> returns. The backend is the **brain + memory** of the app.

---

## 1. High-level architecture

The whole system at a glance — who talks to whom.

```mermaid
flowchart LR
    FE["🖥️ Frontend<br/>(React in browser)"] -->|HTTP /api/...| SRV["🚪 server.js<br/>(Express front door)"]

    SRV --> AUTH["/api/auth<br/>auth.js"]
    SRV --> CHAT["/api/chat<br/>chat.js"]
    SRV --> PLAN["/api/plan<br/>plan.js"]
    SRV --> PROF["/api/profile<br/>profile.js"]

    AUTH --> STORE["🗄️ store.js<br/>(shared memory)"]
    CHAT --> STORE
    PLAN --> STORE
    PROF --> STORE

    CHAT --> AI["🤖 Google Gemini"]
    CHAT --> EMO["🚨 emotionService<br/>(panic safety-net)"]
    CHAT --> RISK["🧮 riskService<br/>(score 0-100)"]
    CHAT --> PB["📊 planService<br/>(build plan)"]

    STORE --> DB[("🍃 MongoDB<br/>or in-memory")]
```

---

## 2. The 4 route "departments"

Every request from the frontend goes to one of these.

| URL prefix     | File         | Job                               |
| -------------- | ------------ | --------------------------------- |
| `/api/auth`    | `auth.js`    | Login & save user details         |
| `/api/chat`    | `chat.js`    | The main conversation (the heart) |
| `/api/plan`    | `plan.js`    | Read the investment plan          |
| `/api/profile` | `profile.js` | Read saved profile / chat history |

---

## 3. Login flow (auth.js)

How a user gets a stable identity that their history "follows."

```mermaid
flowchart TD
    A["User signs in<br/>(email + password)"] --> B{"Email present?"}
    B -- no --> ERR["❌ Error: email required"]
    B -- yes --> C["Build sessionId<br/>usr_email@x.com"]
    C --> D["Save user identity<br/>in store.js"]
    D --> E["Basic-info form<br/>(name, age, income, goal)"]
    E --> F["Pre-fill risk profile<br/>so AI won't re-ask"]
    F --> G["✅ Ready to chat"]

    G2["Google Sign-In"] -. same idea .-> C
```

- The `sessionId` is the **key to everything** — all chats, profile, and plan are stored under it.
- Password isn't really checked (demo gate). Any non-empty value works.

---

## 4. Chat flow — the heart of the app (chat.js)

What happens on **every single message**.

```mermaid
flowchart TD
    M["📨 User sends a message"] --> L["Load profile, history,<br/>and plan by sessionId"]
    L --> P{"Profile complete?"}
    P -- no --> ON["Use ONBOARDING<br/>personality (asks questions)"]
    P -- yes --> AD["Use ADVISOR<br/>personality (gives advice)"]

    ON --> CTX["Add dashboard data<br/>so AI knows real numbers"]
    AD --> CTX

    CTX --> SCAN["🚨 Pre-scan for panic words"]
    SCAN --> CALL["🤖 Call Google Gemini"]
    CALL --> J["AI replies in JSON:<br/>reply + emotion + new facts"]

    J --> SAVE["Save new facts<br/>into profile"]
    SAVE --> CHK{"Profile now<br/>complete?"}
    CHK -- yes --> SCORE["🧮 Compute risk score<br/>+ build plan"]
    CHK -- no --> SKIP["Keep onboarding"]

    SCORE --> STORE2["💾 Save both messages"]
    SKIP --> STORE2
    STORE2 --> R["📤 Send reply + emotion<br/>+ plan status to frontend"]
```

---

## 5. Hybrid panic detection (emotionService.js) — flagship feature

Two layers decide if **Calm Mode** turns on.

```mermaid
flowchart LR
    MSG["User message"] --> NET["Safety-net layer<br/>keyword list<br/>'sell everything', 'cant sleep'"]
    MSG --> LLM["AI layer<br/>Gemini reads emotion"]

    NET --> OR{"Either one<br/>detects distress?"}
    LLM --> OR
    OR -- yes --> CALM["😌 CALM MODE ON<br/>gentle, reassuring tone"]
    OR -- no --> NORM["Normal reply"]
```

> **Why two layers?** AI can be unpredictable. The keyword list **guarantees** Calm Mode
> triggers on demo day, no matter what the AI does.

---

## 6. Risk scoring → plan building (riskService.js + planService.js)

Pure math, **no AI** — turns a profile into a personalized plan.

```mermaid
flowchart TD
    PR["Complete profile"] --> S1["+ Long horizon → more points"]
    PR --> S2["+ Low fear → more points"]
    PR --> S3["+ High savings ratio → more points"]
    PR --> S4["+ Younger age → more points"]

    S1 --> SUM["🧮 Risk score 0-100"]
    S2 --> SUM
    S3 --> SUM
    S4 --> SUM

    SUM --> CAT["Label:<br/>Conservative / Balanced /<br/>Aggressive / Growth"]
    CAT --> TPL["Pick portfolio template<br/>from portfolios.json"]
    TPL --> CALC["Project SIP growth<br/>(compound interest)"]
    CALC --> MILE["Add milestones<br/>+ disclaimer"]
    MILE --> PLAN["📊 Final plan"]
```

---

## 7. Storage (store.js) — the shared notebook

Same functions work whether or not a database is connected.

```mermaid
flowchart TD
    SVC["Any service<br/>(getProfile, savePlan...)"] --> Q{"MongoDB<br/>connected?"}
    Q -- yes --> MDB[("🍃 Save permanently<br/>to MongoDB")]
    Q -- no --> MEM["🧠 Save to temporary<br/>in-memory maps"]
```

> The fallback means the demo **never hard-crashes**, even without a database.

---

## One-line summary

> The frontend talks to an **Express server**. Every message goes through **chat.js**, which
> loads the user's memory, runs a **panic-detector**, asks **Google Gemini** for a reply,
> learns new facts about the user, and once it knows enough, runs a **math-based risk score**
> to **auto-build a personalized investment plan** — all saved under the user's login ID in
> **MongoDB** (or memory as backup).
