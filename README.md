# 🏥 HealthAI — Smart Medical Symptom Assistant

> **Google Antigravity Hackathon Submission**
> An AI-powered medical assistant that analyses symptoms, assesses risk, and connects users with nearby healthcare — built with Google Gemini and Google Maps.

---

## 📌 Chosen Vertical

**Healthcare / Smart Health Assistant**

HealthAI acts as a first-response wellness companion. Users describe their symptoms in plain language; the assistant intelligently analyses those symptoms, provides a risk assessment (Low / Moderate / High), offers personalised guidance, and helps locate the nearest clinics — all within seconds.

---

## 🧠 Approach & Logic

### Core Decision-Making Flow

```
User Input (symptoms, age, duration)
        │
        ▼
  Google Gemini 2.5 Flash API
  ┌──────────────────────────────┐
  │  • Symptom pattern analysis  │
  │  • Risk level classification │
  │  • Differential suggestions  │
  │  • Urgency recommendation    │
  └──────────────────────────────┘
        │
        ▼
  Structured JSON response → React UI
        │
        ▼
  Google Maps → Nearby hospitals/clinics
```

### Key Logic Decisions

| Decision Point | Logic Used |
|---|---|
| **Risk Level** | Gemini classifies symptoms as Low / Moderate / High based on severity keywords, duration, and combinations |
| **Urgency Flag** | If High-risk, UI prominently shows emergency guidance |
| **User Context** | Age, symptom duration, and prior history are injected into the Gemini prompt for personalised analysis |
| **History Sync** | Logged-in users get history persisted server-side (SQLite); guests get local-only history |
| **Admin Access** | Role is stored in JWT; admin routes are guarded server-side via middleware |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 AI Symptom Analysis | Powered by **Google Gemini 2.5 Flash** — structured medical reasoning |
| 🗺️ Nearby Hospitals | **Google Maps JavaScript API** — shows clinics within 5 km |
| 👤 User Accounts | Register / Login with JWT auth, custom avatar & profile colour |
| 📋 History Panel | Analysis history synced to server (authenticated) or stored locally (guest) |
| 📊 Risk Stats | Personal breakdown of Low / Moderate / High analyses over time |
| 🔑 Change Password | Self-service from inside the profile panel |
| 🌙 Dark / Light Mode | System preference aware with manual toggle |
| 👑 Admin Dashboard | Platform stats, user management, activity feed |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Three.js / React Three Fiber |
| **Backend** | Node.js, Express 5 |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | JWT + bcrypt |
| **AI** | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| **Maps** | Google Maps JavaScript API |
| **DevOps** | Docker, Google Cloud Run, Google Cloud Build |

---

## 🚀 How the Solution Works

### 1. Symptom Analysis (Gemini AI)
The user enters symptoms, age, and how long they've had them. The backend builds a structured prompt and calls **Google Gemini 2.5 Flash**. Gemini returns a JSON object with:
- `riskLevel` — Low / Moderate / High
- `possibleConditions[]` — probable diagnoses
- `recommendations[]` — actionable next steps
- `urgency` — whether to seek emergency care
- `disclaimer` — always present for responsible AI use

### 2. Nearby Hospital Map (Google Maps)
After analysis, a **Google Maps** widget appears. It uses the browser's Geolocation API to get the user's position, then renders a map with nearby clinic markers (Places API). Users can click markers to get directions.

### 3. User Authentication & History
- **JWT tokens** (signed with a server secret) are used for stateless auth.
- Passwords are hashed with **bcrypt**.
- On login, analysis history is fetched from the SQLite server database and merged with any local guest history.

### 4. Admin Panel
An admin account seeded from environment variables (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) gets an `is_admin` flag in the DB. The admin JWT contains `role: admin`. Protected server routes check this before returning platform-wide stats and user data.

---

## 📁 Project Structure

```
HealthAI/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # All UI components (Hero, Navbar, AdminPanel, etc.)
│       ├── context/         # AuthContext (global login state)
│       ├── hooks/           # useHistory (analysis history management)
│       └── utils/           # api.js (Axios wrapper)
│
├── server/                  # Node.js + Express backend
│   ├── db/                  # SQLite schema + admin seed script
│   ├── middleware/          # authMiddleware, adminMiddleware
│   ├── routes/              # /auth, /history, /analyze, /admin
│   └── services/            # geminiService.js (AI prompt + parsing)
│
├── Dockerfile               # Multi-stage Docker build for Cloud Run
├── cloudbuild.yaml          # Google Cloud Build CI/CD pipeline
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A [Google Gemini API Key](https://aistudio.google.com)
- A [Google Maps API Key](https://console.cloud.google.com) (Maps JavaScript API + Places API enabled)

### 1. Clone the repo
```bash
git clone https://github.com/raunakiitp/Healthai.git
cd Healthai
```

### 2. Server setup
```bash
cd server
cp .env.example .env
```

Fill in `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=any_long_random_string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
```

```bash
npm install
npm run dev   # runs on http://localhost:5000
```

### 3. Client setup
```bash
cd client
# Create client/.env
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
echo "VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key" >> .env
npm install
npm run dev   # runs on http://localhost:5173
```

---

## 🔐 Security Considerations

- All secrets are stored in environment variables — **never committed to the repository**
- `.env` files are in `.gitignore`
- Passwords are hashed with `bcrypt` (10 rounds)
- Admin routes are double-protected: JWT verification + `is_admin` DB flag check
- Gemini responses include a medical disclaimer, enforced server-side in the prompt
- CORS is restricted to known origins in production

---

## 📋 Assumptions Made

1. **Single-region deployment** — The app is deployed to a single Cloud Run region; no multi-region failover is configured.
2. **Ephemeral SQLite** — On Cloud Run, `/tmp` is used for the SQLite file. This means history is scoped to a running container instance. For production scale, this should be migrated to Cloud SQL or Firestore.
3. **Geolocation permission** — The Maps feature requires the user to grant browser geolocation permission; if denied, the map shows a default location.
4. **Gemini output format** — The system prompt enforces JSON output from Gemini. If the model returns malformed JSON, the backend returns a user-friendly error.
5. **Single admin account** — Only one admin account is seeded, defined at startup via environment variables.
6. **English language input** — The symptom analyser is optimised for English; other languages may produce less accurate results.

---

## 🌐 Google Services Used

| Service | How It's Used |
|---|---|
| **Google Gemini 2.5 Flash** | Core AI engine for symptom analysis and risk classification |
| **Google Maps JavaScript API** | Interactive map to display nearby hospitals/clinics |
| **Google Places API** | Fetches nearby healthcare facilities based on user location |
| **Google Cloud Run** | Serverless container hosting for the full-stack application |
| **Google Cloud Build** | CI/CD pipeline — auto-builds and deploys on git push |

---

## 📄 License
MIT — see [LICENSE](LICENSE) for details.

> ⚠️ **Medical Disclaimer**: HealthAI is an educational/demo project and is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
