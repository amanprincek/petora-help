// PETORA Help — backend API (Phase 2A).
// MySQL-backed report submission. No auth, no admin routes yet (Phase 2B).
//
//   POST /api/reports   create a report (+ optional photo/video)
//   GET  /api/health    liveness + DB check
//
// Citizens can SUBMIT reports only — there is intentionally NO public
// endpoint that lists or reads reports (contact numbers stay private).
// In production this same server serves the built frontend (../dist).

import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import mysql from 'mysql2/promise'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: new URL('./.env', import.meta.url) })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 4000
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petora_help',
  waitForConnections: true,
  connectionLimit: 10,
})

const MAX_MEDIA_BYTES = 15 * 1024 * 1024

function cleanName(name) {
  return String(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `tmp_${Date.now()}_${cleanName(file.originalname)}`),
  }),
  limits: { fileSize: MAX_MEDIA_BYTES },
  fileFilter: (_req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype || '')) cb(null, true)
    else cb(new Error('ONLY_IMAGE_VIDEO'))
  },
})

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

function bad(res, msg) {
  return res.status(400).json({ error: msg })
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'up' })
  } catch {
    res.status(503).json({ ok: false, db: 'down' })
  }
})

// Public report tracking: single-report lookup ONLY.
// Returns public-safe fields — NEVER contact_number, description, or media.
// There is intentionally NO endpoint that lists or browses reports.
const PUBLIC_REPORT_ID = /^PH-PRY-\d{4}-\d+$/

app.get('/api/reports/:reportId', async (req, res) => {
  const reportId = String(req.params.reportId || '').trim().toUpperCase()
  if (!PUBLIC_REPORT_ID.test(reportId) || reportId.length > 30) {
    return res.status(404).json({ error: 'NOT_FOUND' })
  }
  try {
    const [rows] = await pool.execute(
      `SELECT report_id, animal_type, animal_condition, location, status, created_at
       FROM reports WHERE report_id = ? LIMIT 1`,
      [reportId]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'NOT_FOUND' })
    }
    const r = rows[0]
    return res.json({
      reportId: r.report_id,
      animalType: r.animal_type,
      condition: r.animal_condition,
      location: r.location,
      status: r.status,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    })
  } catch (err) {
    console.error('[PETORA Help] Report lookup failed')
    return res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

// Public NGO/Rescuer directory: read-only, active records only,
// public-safe fields only. No dummy data is ever seeded here —
// rows are added later with real verified organization details.
app.get('/api/organizations', async (req, res) => {
  const rawType = String(req.query.type || 'All')
  const type = rawType === 'NGO' || rawType === 'Rescuer' ? rawType : null
  // Strip LIKE wildcards so search text is always matched literally.
  const search = String(req.query.search || '').trim().slice(0, 80).replace(/[\\%_]/g, '')
  try {
    const conds = ['active = 1']
    const params = []
    if (type) {
      conds.push('type = ?')
      params.push(type)
    }
    if (search) {
      const like = `%${search}%`
      conds.push('(name LIKE ? OR area LIKE ? OR location LIKE ?)')
      params.push(like, like, like)
    }
    const [rows] = await pool.execute(
      `SELECT name, type, location, area, description, phone, instagram, verified
       FROM organizations WHERE ${conds.join(' AND ')}
       ORDER BY verified DESC, name ASC LIMIT 100`,
      params
    )
    res.json(
      rows.map((r) => ({
        name: r.name,
        type: r.type,
        location: r.location,
        area: r.area,
        description: r.description,
        phone: r.phone,
        instagram: r.instagram,
        verified: r.verified === 1,
      }))
    )
  } catch (err) {
    console.error('[PETORA Help] Organization lookup failed')
    res.status(500).json({ error: 'SERVER_ERROR' })
  }
})

app.post('/api/reports', (req, res) => {
  upload.single('media')(req, res, async (multerErr) => {
    if (multerErr) {
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return bad(res, 'Photo/video 15MB se bada hai. Chhoti file chunein.')
      }
      return bad(res, 'Sirf photo ya video file upload karein.')
    }

    const animalType = String(req.body.animalType || '').trim().slice(0, 60)
    const condition = String(req.body.condition || '').trim().slice(0, 60)
    const location = String(req.body.location || '').trim().slice(0, 300)
    const description = String(req.body.description || '').trim().slice(0, 2000)
    const contactNumber = String(req.body.contactNumber || '').trim().slice(0, 15)
    const priority = req.body.priority === 'Urgent' ? 'Urgent' : 'Normal'

    if (!animalType || !condition || !location || !contactNumber) {
      if (req.file) fs.unlink(req.file.path, () => {})
      return bad(res, 'Please fill all required fields.')
    }
    if (contactNumber.length < 8) {
      if (req.file) fs.unlink(req.file.path, () => {})
      return bad(res, 'Sahi contact number likhein.')
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // AUTO_INCREMENT guarantees a unique sequence even under concurrency.
      const [result] = await conn.execute(
        `INSERT INTO reports
           (report_id, animal_type, animal_condition, location, description,
            contact_number, priority, status)
         VALUES ('PENDING', ?, ?, ?, ?, ?, ?, 'Report Received')`,
        [animalType, condition, location, description, contactNumber, priority]
      )
      const seq = result.insertId
      const reportId = `PH-PRY-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`

      let mediaPath = ''
      const mediaType = req.file ? req.file.mimetype : ''
      if (req.file) {
        const finalName = `${reportId}_${Date.now()}_${cleanName(req.file.originalname)}`
        const finalPath = path.join(UPLOAD_DIR, finalName)
        fs.renameSync(req.file.path, finalPath)
        mediaPath = finalPath
      }

      await conn.execute(
        `UPDATE reports SET report_id = ?, media_path = ?, media_type = ? WHERE id = ?`,
        [reportId, mediaPath, mediaType, seq]
      )
      await conn.commit()
      return res.status(201).json({ reportId })
    } catch (err) {
      await conn.rollback().catch(() => {})
      if (req.file) fs.unlink(req.file.path, () => {})
      console.error('[PETORA Help] Report insert failed:', err?.code || err?.message || err)
      return res.status(500).json({ error: 'Report submit nahi ho paayi. Please try again.' })
    } finally {
      conn.release()
    }
  })
})

// Serve the built frontend in production (vite build → ../dist).
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[PETORA Help] API listening on http://localhost:${PORT}`)
})
