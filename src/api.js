// Report submission via the PETORA Help backend API (MySQL).
// Same-origin by default (Vite proxies /api → localhost:4000 in dev,
// and the backend serves the built site in production).
// Set VITE_API_URL only if the API lives on a different origin.
//
// NOTE: contact numbers are never logged to the console.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const MAX_MEDIA_BYTES = 15 * 1024 * 1024

/**
 * Looks up one report by ID. Returns public-safe fields only
 * (reportId, animalType, condition, location, status, createdAt).
 * Throws coded errors: INVALID_ID | NOT_FOUND | NETWORK | SERVER_ERROR.
 */
export async function trackReport(reportId) {
  const id = String(reportId || '').trim().toUpperCase()
  if (!/^PH-PRY-\d{4}-\d+$/.test(id) || id.length > 30) {
    const err = new Error('INVALID_ID')
    err.code = 'INVALID_ID'
    throw err
  }
  let res
  try {
    res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(id)}`)
  } catch {
    const err = new Error('NETWORK')
    err.code = 'NETWORK'
    throw err
  }
  if (res.status === 404) {
    const err = new Error('NOT_FOUND')
    err.code = 'NOT_FOUND'
    throw err
  }
  if (!res.ok) {
    const err = new Error('SERVER_ERROR')
    err.code = 'SERVER_ERROR'
    throw err
  }
  return res.json()
}

/**
 * Searches active organizations (public-safe fields only).
 * Throws coded errors: NETWORK | SERVER_ERROR.
 */
export async function findOrganizations({ search = '', type = 'All' } = {}) {
  const params = new URLSearchParams()
  if (String(search).trim()) params.set('search', String(search).trim())
  if (type === 'NGO' || type === 'Rescuer') params.set('type', type)
  let res
  try {
    res = await fetch(`${API_BASE}/api/organizations?${params.toString()}`)
  } catch {
    const err = new Error('NETWORK')
    err.code = 'NETWORK'
    throw err
  }
  if (!res.ok) {
    const err = new Error('SERVER_ERROR')
    err.code = 'SERVER_ERROR'
    throw err
  }
  return res.json()
}

/**
 * Lists open help requirements (public-safe fields only, NGO resolved).
 * Pass { category } to filter; omit for all. Never returns Fulfilled rows.
 * Throws coded errors: NETWORK | SERVER_ERROR.
 */
export async function listHelpRequests({ category = '' } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  let res
  try {
    res = await fetch(`${API_BASE}/api/help-requests?${params.toString()}`)
  } catch {
    const err = new Error('NETWORK')
    err.code = 'NETWORK'
    throw err
  }
  if (!res.ok) {
    const err = new Error('SERVER_ERROR')
    err.code = 'SERVER_ERROR'
    throw err
  }
  return res.json()
}

/**
 * Submits a report. Throws with a user-safe message on failure.
 * @returns {Promise<string>} the human-readable reportId (e.g. PH-PRY-2026-00001)
 */
export async function submitReport(form, file) {
  const animalType = String(form.animalType || '').trim()
  const condition = String(form.condition || '').trim()
  const location = String(form.location || '').trim()
  const description = String(form.description || '').trim()
  const contactNumber = String(form.contactNumber || '').trim()
  const priority = form.priority === 'Urgent' ? 'Urgent' : 'Normal'

  if (!animalType || !condition || !location || !contactNumber) {
    throw new Error('Please fill all required fields.')
  }
  if (file) {
    if (file.size > MAX_MEDIA_BYTES) {
      throw new Error('Photo/video 15MB se bada hai. Chhoti file chunein.')
    }
    if (!/^(image|video)\//.test(file.type || '')) {
      throw new Error('Sirf photo ya video file upload karein.')
    }
  }

  const body = new FormData()
  body.append('animalType', animalType)
  body.append('condition', condition)
  body.append('location', location)
  body.append('description', description)
  body.append('contactNumber', contactNumber)
  body.append('priority', priority)
  if (file) body.append('media', file, file.name)

  let res
  try {
    res = await fetch(`${API_BASE}/api/reports`, { method: 'POST', body })
  } catch {
    throw new Error('Server se connect nahi ho paaya. Please try again.')
  }

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* non-JSON error body */
  }

  if (!res.ok || !data.reportId) {
    throw new Error(data.error || 'Report submit nahi ho paayi. Please try again.')
  }
  return data.reportId
}
