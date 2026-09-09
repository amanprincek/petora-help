# PETORA Help — Phase 1 Prototype

Modern, simple, responsive frontend prototype. React + Vite, no backend.

## Run

```bash
npm install
npm run dev
```

Build: `npm run build` • Preview: `npm run preview`

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
- Report modal submits for real: atomic Report ID (PH-PRY-YYYY-XXXXX) → photo/video to Firebase Storage → document in Firestore `reports` (status "Report Received"). See **FIREBASE_SETUP.md** — without `.env` config the form shows a setup notice and never fakes success.
