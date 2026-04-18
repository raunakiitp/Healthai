# 🏥 HealthAI — Smart Symptom Assistant

An AI-powered medical symptom analysis app built with **React + Vite** (frontend) and **Node.js / Express** (backend), using the **Google Gemini API**.

> ⚠️ This is an educational/demo project and is **not** a substitute for real medical advice.

---

## ✨ Features

- 🧠 **AI Symptom Analysis** — powered by Google Gemini 2.5 Flash
- 🗺️ **Nearby Hospital Map** — find clinics within 5km
- 👤 **User Accounts** — register, login, profile with custom avatar & color
- 📋 **History Panel** — analyses synced to server when logged in
- 📊 **Analysis Stats** — see your personal risk level breakdown
- 🔑 **Change Password** — from inside the profile panel
- 🌙 **Dark / Light Mode**
- 👑 **Admin Panel** — restricted dashboard for platform management (see below)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API Key](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/raunakiitp/Healthai.git
cd Healthai
```

### 2. Setup the Server
```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your values:
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=any_long_random_string
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password
```

Then install and run:
```bash
npm install
npm run dev
```

Server runs at **http://localhost:5000**

### 3. Setup the Client
```bash
cd client
npm install
npm run dev
```

Client runs at **http://localhost:5173**

---

## 👤 Creating an Account

1. Open the app at `http://localhost:5173`
2. Click **Sign In** in the navbar
3. Switch to the **Register** tab
4. Fill in your name, email, and password
5. You're in! Your analysis history will sync across devices

---

## 👑 Admin Panel

The app includes a restricted **Admin Dashboard** accessible only to admin accounts.

To set up your admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` before starting the server — the admin account will be created automatically on first run.

Once logged in as admin, a red **"Admin"** button will appear in the navbar, giving access to:
- Platform statistics & charts
- Full user management (view, ban, promote, delete)
- System-wide activity feed

> Admin credentials are configured privately via environment variables and are never committed to the repository.

---

## 📁 Project Structure

```
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # UI components
│       ├── context/         # AuthContext
│       ├── hooks/           # useHistory
│       └── utils/           # api.js
│
└── server/                  # Node.js + Express backend
    ├── db/                  # SQLite setup + admin seed
    ├── middleware/           # auth + admin middleware
    ├── routes/              # auth, history, analyze, admin
    └── services/            # Gemini AI service
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| AI | Google Gemini 2.5 Flash |
| 3D | Three.js, React Three Fiber |

---

## 📄 License
MIT
