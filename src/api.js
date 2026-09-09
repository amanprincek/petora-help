// Report submission via the PETORA Help backend API (MySQL).
// Same-origin by default (Vite proxies /api → localhost:4000 in dev,
// and the backend serves the built site in production).
// Set VITE_API_URL only if the API lives on a different origin.
//
// NOTE: contact numbers are never logged to the console.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const MAX_MEDIA_BYTES = 15 * 1024 * 1024

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
