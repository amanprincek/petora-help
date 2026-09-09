# PETORA Help — Progress Tracker

> **Rule:** Update this file on EVERY change / updation.
> Add a new row to `Change Log` + update `Current Status` + bump `Last Updated`.
> Format: `YYYY-MM-DD — short title`

- **Project:** PETORA Help (Phase 2A — Express + MySQL backend)
- **Stack:** React 18 + Vite 5 frontend, Express 4 + MySQL 8 backend, no auth / payment
- **Last Updated:** 2026-09-09
- **Current Version:** v0.6.0 (MySQL-backed submission, tested live, build passing)

---

## Current Status

- [x] Minimal homepage: Navbar → Hero → 3 Actions → Bas 3 Steps → About → NGO empty state → Footer
- [x] Report submission is REAL (MySQL): `POST /api/reports` → transaction-safe `AUTO_INCREMENT` ID (`PH-PRY-YYYY-XXXXX`) → photo to `backend/uploads/` → `reports` row (status "Report Received", timestamp)
- [x] Honest states: loading ("Report submit ho rahi hai..."), real 400/500 errors + Try Again, success with Copy Report ID
- [x] Secure by design: create-only public API (no list/read endpoint), prepared statements, 15MB image/video-only uploads outside web root
- [x] Tested live against local MySQL 8.0 (2 reports + validation rejections); test data cleaned, counter reset
- [x] Homepage UI untouched (same design, branding, sections)
- [x] Responsive mobile-first design, Hinglish/हिंदी toggle (demo)
- [x] `npm run build` passes
- [x] Official logo integrated (navbar circle + favicon, from `src/logo.jpeg` / `public/logo.jpeg`)
- [ ] Real NGO data (waiting on admin input — Phase 2)
- [ ] Backend / tracking / payment (explicitly out of scope for Phase 1)

## How To Run

```bash
npm install
npm run dev
npm run build
```

## How To Update This File (for every future change)

1. Add row to `Change Log` below (newest on top).
2. Update `Last Updated` + `Current Version` at top.
3. Update `Current Status` checkboxes if scope changed.
4. Keep it to 2–5 lines per change — link files touched.

---

## Change Log

| Date | Version | Change | Files Touched | Status |
|------|---------|--------|---------------|--------|
| 2026-09-09 | v0.6.0 | MySQL switch: Firebase removed; new Express backend (report API, schema, health, prod static serving); frontend rewired via src/api.js; dev proxy; live-tested on local MySQL 8.0, test data cleaned; docs updated | `backend/`, `src/api.js`, `src/App.jsx`, `vite.config.js`, `.env.example`, `MYSQL_SETUP.md`, `README.md`, `PROGRESS.md` (removed: `src/firebase.js`, `src/reports.js`, `firestore.rules`, `storage.rules`, `FIREBASE_SETUP.md`) | ✅ Done, verified live |
| 2026-09-09 | v0.5.0 | Phase 2A: real Firebase submission (atomic PH-PRY-YYYY-XXXXX IDs, Storage media, Firestore reports, loading/error/copy states, secure rules, setup guide); Firebase lazy-loaded; homepage untouched | `src/firebase.js`, `src/reports.js`, `src/App.jsx`, `src/index.css`, `firestore.rules`, `storage.rules`, `FIREBASE_SETUP.md`, `.env.example`, `.gitignore`, `package.json`, `README.md`, `PROGRESS.md` | ⚠️ Superseded by v0.6.0 (MySQL switch) |
| 2026-09-09 | v0.4.0 | Visual-only pass: compact hero + warmer human-animal photo (with fallback), tinted action choices (red Report / green others), "Bas 3 Steps" strip, plain About text, single NGO empty state, tightened spacing, social placeholders | `src/App.jsx`, `src/index.css`, `README.md`, `PROGRESS.md` | ✅ Done |
| 2026-09-09 | v0.3.0 | Simplified homepage ~65%: removed How It Works, Resources, Emergency, Mission, Contact, filters, donation catalogue; new hero copy; minimal nav/footer; trimmed CSS | `src/App.jsx`, `src/index.css`, `README.md`, `PROGRESS.md` | ✅ Done |
| 2026-09-09 | v0.2.0 | Integrated uploaded official logo (navbar circle + favicon); copied src → public; build re-verified | `src/App.jsx`, `src/index.css`, `index.html`, `public/logo.jpeg`, `README.md`, `PROGRESS.md` | ✅ Done |
| 2026-09-09 | v0.1.0 | Created PROGRESS.md tracker; documented Phase 1 baseline | `PROGRESS.md` | ✅ Done |
| 2026-09-09 | v0.1.0 | Added README with run instructions + logo slot documentation | `README.md` | ✅ Done |
| 2026-09-09 | v0.1.0 | Verified production build passes (`vite build` — 31 modules, no errors) | `dist/` (output) | ✅ Done |
| 2026-09-09 | v0.1.0 | Built all homepage sections + Report modal + Find NGO + Donate + Contact + Footer; fixed logo fallback + footer style bug | `src/App.jsx`, `src/index.css` | ✅ Done |
| 2026-09-09 | v0.1.0 | Added global stylesheet: green/beige theme, responsive breakpoints (900px / 520px), modal/cards/footer styles | `src/index.css` | ✅ Done |
| 2026-09-09 | v0.1.0 | Added React entry + all UI components (Navbar, Hero, Actions, HowItWorks, NGO, Donate, Emergency, Mission, Contact) | `src/main.jsx`, `src/App.jsx` | ✅ Done |
| 2026-09-09 | v0.1.0 | Scaffolded Vite React app (React 18, plugin-react, Google Fonts, title/meta) | `package.json`, `vite.config.js`, `index.html` | ✅ Done |

---

## Product Rules Locked (do not violate without explicit approval)

- Brand is always **PETORA Help** — never Fedora / Patora / other spelling.
- No real NGO names, phone numbers, Instagram handles, or addresses. Only `Verified NGO — Prayagraj` / `Details coming soon` placeholders.
- NEVER list `love_shade_for_animals` or `rakshamad` unless explicitly permitted.
- No fake stats (no "500+ rescued" etc.).
- No auth, DB, Firebase, payment gateway, admin panel, AI, backend in Phase 1.
- Wording: `Starting from Prayagraj` / `Prayagraj se shuruaat` — never claim all-India operation.
- PETORA Help is a **connector/mediator, NOT an NGO**.

## Pending / Next Up

- [ ] Add official logo file at `public/logo.png` (auto-picked up by navbar)
- [ ] Replace demo hero image with approved photography if needed
- [ ] Phase 2 (only when approved): real NGO data model, report tracking, admin-managed requirements
