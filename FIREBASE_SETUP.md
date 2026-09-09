# PETORA Help — Firebase Setup (Phase 2A)

The app code is complete. Firebase is **not connected yet** — follow these
exact steps once, then reports will save permanently. Until then, the Report
form shows a setup notice and refuses to fake a submission.

No login/signup is added for citizens. No admin dashboard exists yet.

---

## Step 1 — Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project**.
2. Name it `petora-help` (any name works). Google Analytics: optional (skip is fine).

## Step 2 — Create Firestore Database

1. Left menu → **Build → Firestore Database** → **Create database**.
2. Location: `asia-south1` (Mumbai — closest to Prayagraj).
3. Start in **production mode** (secure default), then go to the **Rules** tab,
   delete everything, paste the full contents of `firestore.rules`
   from this repo, and click **Publish**.
4. Collections (`reports`, `counters`) are created automatically on first
   submit — do NOT create them manually.

## Step 3 — Enable Storage

1. Left menu → **Build → Storage** → **Get started** → same region.
2. Go to the **Rules** tab, paste the full contents of `storage.rules`
   from this repo, and click **Publish**.

## Step 4 — Register the web app + get config

1. Project Overview → **Add app → Web** (nickname `petora-help-web`).
2. Copy the `firebaseConfig` values.
3. In this project folder: copy `.env.example` to `.env` and fill it:

```bash
copy .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. Restart the dev server (`npm run dev`) after creating/editing `.env`.
   `.env` is git-ignored and never committed.

## Step 5 — Test the real flow

1. `npm run dev` → open site → **Report an Animal** → fill form → Submit.
2. Watch button change to *"Report submit ho rahi hai..."*.
3. Success screen shows a real Report ID like `PH-PRY-2026-00001`.
4. Verify in console: **Firestore → `reports`** — the document contains:
   `reportId`, `animalType`, `condition`, `location`, `description`,
   `contactNumber`, `priority`, `status = "Report Received"`,
   `createdAt` (timestamp), `mediaUrl`/`mediaPath` when a photo was attached.
5. Verify in console: **Firestore → `counters/reports`** — `seq` = number
   of reports submitted. IDs stay unique even with simultaneous submits.
6. Verify in console: **Storage → `reports/<reportId>/`** — uploaded file.

## Security notes (why this is safe without login)

- Public users can only **create** reports — they cannot read, list,
  update, or delete them, so no contact numbers ever leak publicly.
- The counter document exposes a single number and can only increment
  by exactly +1 per write; nothing else can be written there.
- Admins access data through the Firebase Console (Google-account IAM),
  never through the website. Phase 2B will add a proper admin role.
- Contact numbers are never printed to the browser console.

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Setup notice inside the Report form | `.env` missing/incomplete, or dev server not restarted after adding it |
| `Missing or insufficient permissions` | Rules not published yet — repeat Steps 2–3 and confirm **Publish** |
| Photo upload fails, report not saved | File > 15MB or not image/video; Storage rules not published |
| Counter error on first submit | Normal if `counters` collection doesn't exist — the transaction creates it; if rules block it, re-check the `counters/reports` block |
