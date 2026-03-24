# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FrapApp** is a full-stack mobile application for paramedics to fill out FRAP (emergency response) patient reports. It consists of:

- **Frontend:** React Native (Expo) — `frontend_mobileapp/`
- **Backend:** Express.js (Node.js) — `backend_mobileapp/`
- **Database:** MySQL

## Commands

### Frontend (from `frontend_mobileapp/`)

```bash
npm install
npx expo start       # Start dev server (press i/a/w for iOS/Android/Web)
```

### Backend (from `backend_mobileapp/`)

```bash
npm install
node server.js       # Starts on port 3000 (or process.env.PORT)
```

Health check: `GET http://localhost:3000/api/health`

### Linting (Frontend)

```bash
npx eslint .
```

## Architecture

### Backend (MVC pattern)

```
server.js → routes/ → controllers/ → config/db_connection.js (MySQL pool)
                  ↓
             middleware/ (auth JWT, validation, error handling)
             schemas/    (Zod v4 request validation)
             utils/      (transaction helpers)
```

**API routes:**
- `/api/authParamedicos` — login/logout/session
- `/api/paramedicos` — paramedic management
- `/api/pacientes` — patient data
- `/api/reportes` — FRAP report submission & retrieval
- `/api/admins` — admin operations

Security: JWT auth, bcrypt passwords, Helmet, rate limiting (100 req/15min), CORS whitelist.

### Frontend (Expo Router)

```
app/_layout.tsx     → Auth gate: checks AsyncStorage for JWT, routes to login or home
app/index.js        → Login screen
app/home.js         → Main dashboard (authenticated)
app/frap.js         → FRAP form orchestrator (manages 14 section components)
frap_sections/      → 14 independent form section components
config.js           → API base URL
```

**FRAP form sections** (in `frap_sections/`): Patient, Witness, Vitals, General, ESCGW, AnatomicId, Pupils, Injury, Notes, Supplies, Transportation, Pictures, Signature, SaveButton.

`frap.js` owns all form state and passes it down via props/callbacks to each section component. On submit, it POSTs to `/api/reportes`.

**Auth flow:** JWT stored in AsyncStorage → attached to API requests → `_layout.tsx` re-checks on mount to determine initial route.
