# PETORA Help — Phase 2A (MySQL)

Simple, responsive frontend + small Express/MySQL backend. No auth, no admin yet.

## Run (both required)

```bash
# 1. Database (once): mysql -u root -p < backend/schema.sql
# 2. Backend:  copy backend\.env.example backend\.env  (fill DB password)
npm install --prefix backend
npm --prefix backend start    # http://localhost:4000/api/health

# 3. Frontend:
npm install
npm run dev                   # http://localhost:5173
```

Full guide: **MYSQL_SETUP.md**. Production: `npm run build`, then the backend serves the site itself.

## Official logo

Using the uploaded official PETORA logo (`src/logo.jpeg`, copied to `public/logo.jpeg`).
Shown as a circle in the navbar next to "PETORA Help" + used as the browser favicon.
To replace: overwrite both files with the new image (same filenames).

## What's inside (minimal prototype)

- Navbar: logo + Home, About + Hinglish/हिंदी toggle + "Report an Animal"
- Hero: "Kisi Jaanwar Ko Help Chahiye?" + one photo + one Report button
- 3 main actions: Report (soft red accent) / Find NGO / Donate (green tones)
- "Bas 3 Steps" compact strip + "PETORA Help kya hai?" plain text
- NGO section: single "NGO listings coming soon" empty state (no fake cards)
- Simple footer: Home, About, Contact + © PETORA Help
- Report modal submits for real: `POST /api/reports` → MySQL `reports` row (status "Report Received") + photo saved on server. Returns atomic Report ID (`PH-PRY-YYYY-XXXXX`) with Copy button. See **MYSQL_SETUP.md**.
- Track modal ("Track Report" link under the 3 actions): `GET /api/reports/:reportId` returns public-safe fields only + 6-stage progress timeline. No contact/description/media ever exposed.
- Find NGO modal ("Find Help" button): search + All/NGO/Rescuer filters over `GET /api/organizations` (active rows, public-safe fields). Live with 2 verified entries (Love Shade for Animals, RakshaMAD) — added only with explicit approval, no invented fields.
- Donate modal ("Help an NGO" button): 5 help categories (toggle filters) + open requirement cards from `GET /api/help-requests` (NGO name resolved, Call/Instagram from org data) + 3-step explainer. LIVE: 8 verified winter requirements from Love Shade for Animals (exact provided values) — no payment gateway, PETORA Help receives nothing.
