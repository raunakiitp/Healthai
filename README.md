# 🏥 HealthAI — Smart Symptom Assistant

An AI-powered medical symptom analysis app built with **React + Vite** (frontend) and **Node.js / Express** (backend), using the **Google Gemini API**.

> ⚠️ This is an educational/demo project and is **not** a substitute for real medical advice.

---

## ✨ Features

### User Features
- 🧠 **AI Symptom Analysis** — powered by Google Gemini 2.5 Flash
- 🗺️ **Nearby Hospital Map** — find clinics within 5km
- 📋 **History Panel** — past analyses synced to server when logged in
- 👤 **User Accounts** — register, login, profile with avatar & color
- 🔑 **Change Password** — from inside the profile panel
- 🌙 **Dark / Light Mode** — with system preference detection
- 📊 **Analysis Stats** — see your risk level breakdown

### Admin Features
- 👑 **Admin Dashboard** — slides in from the left (only for admins)
- 📈 **Overview Stats** — total users, active today, analyses, risk breakdown, 7-day chart
- 👥 **User Management** — search, view details, ban/unban, promote to admin, delete
- 🔄 **Clear User History** — from admin user detail drawer
- ➕ **Create User** — directly from the admin panel
- 📡 **Activity Feed** — latest 30 analyses across all users with risk levels

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
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

Server runs at **http://localhost:5000**

On first run, an admin account is automatically created:
- **Email:** `admin@healthai.com`
- **Password:** `admin@123`

### 3. Setup the Client
```bash
cd client
npm install
npm run dev
```

Client runs at **http://localhost:5173**

---

## 📁 Project Structure

```
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # UI components
│       │   ├── AuthModal.jsx
│       │   ├── ProfilePanel.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── ...
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useHistory.js
│       └── utils/
│           └── api.js
│
└── server/                  # Node.js + Express backend
    ├── db/
    │   └── database.js      # SQLite setup + admin seed
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── adminMiddleware.js
    ├── routes/
    │   ├── auth.js          # Register / Login / Profile
    │   ├── history.js       # Per-user analysis history
    │   ├── analyze.js       # Gemini AI analysis
    │   └── admin.js         # Admin-only routes
    └── app.js
```

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | User | Get current user |
| PUT | `/api/auth/profile` | User | Update name/avatar |
| PUT | `/api/auth/change-password` | User | Change password |
| POST | `/api/analyze` | — | AI symptom analysis |
| GET | `/api/history` | User | Fetch history |
| POST | `/api/history` | User | Save entry |
| DELETE | `/api/history/:id` | User | Delete one entry |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | List all users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| POST | `/api/admin/users/:id/ban` | Admin | Toggle ban |
| POST | `/api/admin/users/:id/promote` | Admin | Toggle admin role |
| GET | `/api/admin/activity` | Admin | Recent activity feed |

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
