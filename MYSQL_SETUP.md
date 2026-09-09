# PETORA Help — MySQL Backend Setup (Phase 2A)

Reports are stored in **MySQL** via a small Express API in `backend/`.
The React frontend calls it — browsers cannot talk to MySQL directly,
so both parts below are required.

No login/signup for citizens. No admin dashboard yet (Phase 2B).

---

## Prerequisites

- Node.js 18+ (`node --version`)
- MySQL 8.0 running (local `MySQL80` service is fine)

## Step 1 — Create the database (once)

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `petora_help` database and the `reports` table.
Verify:

```bash
mysql -u root -p petora_help -e "DESCRIBE reports;"
```

## Step 2 — Configure the backend (once)

```bash
copy backend\.env.example backend\.env
```

Edit `backend/.env` with your MySQL credentials:

```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=petora_help
```

`backend/.env` is git-ignored and never committed.

## Step 3 — Install + start the backend

```bash
npm install --prefix backend
npm --prefix backend start
```

Check health: open http://localhost:4000/api/health
→ `{"ok":true,"db":"up"}` means MySQL is connected.

## Step 4 — Start the frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173. In dev, `/api` calls are proxied to the
backend automatically (see `vite.config.js`). No frontend `.env` needed
unless the API runs on a different origin — then set `VITE_API_URL`
(see `.env.example`).

## Step 5 — Test the real flow

1. **Report an Animal** → fill form (attach a photo) → Submit.
2. Button shows *"Report submit ho rahi hai..."*.
3. Success screen shows e.g. `PH-PRY-2026-00001` + Copy button.
4. Verify in MySQL:

```sql
SELECT id, report_id, animal_type, animal_condition, location,
       contact_number, priority, status, media_type, created_at
FROM petora_help.reports;
```

Expected: `status = 'Report Received'`, `created_at` filled,
`media_type` like `image/jpeg` when a photo was attached.
Uploaded files land in `backend/uploads/` (git-ignored, never public).

Track lookup returns only `reportId, animalType, condition, location,
status, createdAt` — never `contact_number`, `description`, or media.
Test it: `curl http://localhost:4000/api/reports/PH-PRY-2026-00001`
(unknown IDs return 404).

## Organizations directory (Find NGO phase)

`schema.sql` also creates the `organizations` table
(`name, type, location, area, description, phone, instagram,
verified, active, created_at`).
**Never insert dummy rows** — the API's empty state covers "no data".

`GET /api/organizations?search=&type=` returns active rows only,
verified first, with public-safe fields. Search matches
name/area/location literally (wildcards stripped); `type` accepts
only `NGO`/`Rescuer` (anything else = All).

## Production (single server)

```bash
npm run build
npm --prefix backend start
```

The backend serves `../dist` at http://localhost:4000 — one process,
no proxy or extra config needed.

## Security notes

- Public API has `POST /api/reports` (create), `GET /api/reports/:reportId`
  (single-report tracking), + `GET /api/health`.
  There is **no endpoint that lists or reads reports**, so contact
  numbers never leak publicly. Admin access comes in Phase 2B.
- All SQL uses prepared statements (`mysql2` placeholders) — no injection.
- Uploads: 15MB max, images/videos only, stored outside the web root
  (`backend/uploads/` is not served). Malware scanning of uploads is
  recommended before Phase 2B admin previews.
- Report IDs come from `AUTO_INCREMENT` inside a transaction — unique
  even with simultaneous submissions, never guessable-enumerable publicly
  since there is no lookup endpoint.

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `{"ok":false,"db":"down"}` or `Server se connect nahi ho paaya` | Backend not running, or `backend/.env` credentials wrong — start backend, check `.env` |
| `Access denied for user` in backend logs | Wrong `DB_USER`/`DB_PASSWORD` in `backend/.env` |
| `Table 'petora_help.reports' doesn't exist` | Step 1 not run — execute `schema.sql` |
| Photo rejected | File > 15MB or not image/video |
| Dev frontend can't reach API | Backend must run on port 4000 alongside `npm run dev` |
