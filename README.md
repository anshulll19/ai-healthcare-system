# NeuroVoice — AI-Powered ALS Healthcare Assistant

> **Team MedNexus** — University of Delhi, Dept. of Computer Engineering

A production-ready, accessibility-first AI platform that helps ALS (Amyotrophic Lateral Sclerosis) patients **communicate**, **track symptoms**, and enables **caregivers** to provide better care — powered by intelligent automation.

---

## 🎯 Core Features

### 🗣️ AI Communication Assistant
- **Predictive text** — AI anticipates patient intent from partial input
- **Text-to-Speech** — Browser-native TTS with emotional tone detection
- **12 Quick-access phrase categories** — Pain, Water, Breathing, Help, Medication, etc.
- **Emergency SOS** — One-tap alerts with instant caregiver notification
- **Communication history** logging

### 📊 ALS Symptom Tracker + AI Analysis
- Track 6 key ALS metrics (muscle, speech, swallowing, breathing, mobility, fatigue)
- **ALSFRS-R inspired** scoring system
- **AI risk analysis** with progression prediction
- **Chart.js progression graphs** showing trends over time
- **Rapid decline detection** with urgent warnings

### 👨‍⚕️ Caregiver Dashboard
- **Real-time patient monitoring** with risk indicators
- **Live emergency alerts** with resolve functionality
- **AI-generated care suggestions** based on patient symptoms
- **Medication management** and caregiver notes
- **Auto-refresh** (5-second polling)

### 📚 ALS Health Education
- **8 comprehensive topics** (What is ALS, Symptoms, Treatments, Clinical Trials, etc.)
- **Hindi/English** language switcher (Indian users focus)
- **Simple/Detailed** mode toggle
- **Treatment info** — Riluzole, Edaravone, AMX0035 with dosages
- **Medical term search** with AI explanations
- **Emotional support resources** with Indian helplines

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS 3.4 |
| **Backend** | Flask 3 + Flask-SQLAlchemy + Flask-BCrypt |
| **Database** | SQLite (zero-config, demo-ready) |
| **AI Engine** | Rule-based NLP (zero-cost, offline, instant) |
| **Charts** | Chart.js + react-chartjs-2 |
| **TTS** | Web Speech API (browser-native) |
| **Icons** | Lucide React |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Default Accounts

Register new accounts through the UI. Select **Patient** or **Caregiver** role during signup.

Admin access: register with `admin@gmail.com`.

---

## 📁 Project Structure

```
hackathon-healthcare-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # SQLite config
│   │   ├── models.py            # 9 models (User, ALS Symptoms, Messages, Alerts, etc.)
│   │   ├── routes/
│   │   │   ├── als.py           # ALS API (30+ endpoints)
│   │   │   ├── auth.py          # Auth with role support
│   │   │   ├── health.py        # General health records
│   │   │   ├── admin.py         # Admin management
│   │   │   └── reports.py       # PDF reports
│   │   └── utils/
│   │       ├── ai_assistant.py  # AI Engine (Communication, Symptom, Education, Caregiver)
│   │       └── auth_utils.py    # Session auth decorators
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Role-based routing
│   │   ├── Auth.tsx             # Login/Register with role selector
│   │   ├── Layout.tsx           # Sidebar + header + SOS button
│   │   ├── Dashboard.tsx        # ALS patient home
│   │   └── pages/
│   │       ├── ALSCommunicationPage.tsx   # AI text prediction + TTS + SOS
│   │       ├── ALSSymptomTrackerPage.tsx  # Symptom tracking + AI analysis
│   │       ├── CaregiverDashboard.tsx     # Patient monitoring + alerts
│   │       └── HealthEducation.tsx        # Education + Hindi support
│   ├── index.css                # Accessibility-first design system
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🎬 Demo Script (3 minutes)

### Scene 1: Emergency Communication (60s)
1. Login as patient → Show dashboard with risk status
2. Navigate to Communication → Type "I need" → Show AI predictions
3. Tap quick phrase "Having trouble breathing" → Hear TTS speak it
4. Hit **SOS Breathing** → Show emergency alert created

### Scene 2: Symptom Tracking (60s)
1. Navigate to Symptoms → Slide muscle weakness to 8, breathing to 7
2. Submit → Show AI risk analysis gauge (High risk)
3. Show ALSFRS-R score and AI recommendations
4. Switch to Analysis tab → Show Chart.js progression graph

### Scene 3: Caregiver Dashboard (40s)
1. Login as caregiver → Show patient cards with risk levels
2. Show unresolved emergency alert from Scene 1
3. Resolve the alert → Show response time
4. Show AI care suggestions

### Scene 4: Health Education (20s)
1. Toggle to Hindi → Show "ALS क्या है?"
2. Search "Riluzole" → Show drug explanation
3. Show emotional support resources with Indian helplines

---

## 👥 Team

| Member | Contribution |
|--------|-------------|
| Anshul Singh | DB schema, AI engine, ALS routes |
| Manasi Sharma | Auth, communication assistant |
| Aaniya | Symptom tracker, education module |
| Gagan | Caregiver dashboard, alerting |
| Shakti Singh | Frontend design, accessibility |

---

## 🔑 Design Principles

- **Accessibility-first** — Large buttons (56px+), high contrast, focus rings
- **ALS-specific** — Every feature designed for ALS patient pain points
- **Zero-cost AI** — No API keys needed, works offline
- **Low cognitive load** — Minimal UI, few clicks to accomplish any task
- **Real-time** — 5-second polling for alerts, instant TTS
