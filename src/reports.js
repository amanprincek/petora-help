// Real report submission for PETORA Help (Phase 2A).
// Flow: reserve unique Report ID (atomic counter) → upload media (if any)
// → create Firestore `reports` document → return human-readable reportId.
//
// NOTE: contact numbers are never logged to the console.

import { getDb, getStorage } from './firebase.js'

const MAX_MEDIA_BYTES = 15 * 1024 * 1024 // must match storage.rules

function cleanFileName(name) {
  return String(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

/** Atomically reserves the next sequence number. Safe under concurrency. */
async function reserveSequence(db) {
  const { doc, runTransaction } = await import('firebase/firestore')
  const counterRef = doc(db, 'counters', 'reports')
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef)
    const next = (snap.exists() ? Number(snap.data().seq) || 0 : 0) + 1
    tx.set(counterRef, { seq: next }, { merge: true })
    return next
  })
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

  const db = await getDb()

  // 1. Unique, readable Report ID — reserved atomically, never random-only.
  const year = new Date().getFullYear()
  const seq = await reserveSequence(db)
  const reportId = `PH-PRY-${year}-${String(seq).padStart(5, '0')}`

  // 2. Media upload (optional). A failed upload fails the submission
  //    loudly instead of silently dropping the photo/video.
  let mediaUrl = ''
  let mediaPath = ''
  let mediaType = ''
  if (file) {
    if (file.size > MAX_MEDIA_BYTES) {
      throw new Error('Photo/video 15MB se bada hai. Chhoti file chunein.')
    }
    if (!/^(image|video)\//.test(file.type || '')) {
      throw new Error('Sirf photo ya video file upload karein.')
    }
    mediaPath = `reports/${reportId}/${Date.now()}_${cleanFileName(file.name)}`
    mediaType = file.type
    try {
      const storage = await getStorage()
      const { getDownloadURL, ref, uploadBytes } = await import('firebase/storage')
      const mediaRef = ref(storage, mediaPath)
      await uploadBytes(mediaRef, file)
      mediaUrl = await getDownloadURL(mediaRef)
    } catch (err) {
      console.error('[PETORA Help] Media upload failed for report ' + reportId)
      throw new Error('Photo/video upload nahi ho paaya. Please try again.')
    }
  }

  // 3. Permanent Firestore document (auto document ID + human reportId).
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
    await addDoc(collection(db, 'reports'), {
      reportId,
      animalType,
      condition,
      location,
      description,
      contactNumber,
      priority,
      status: 'Report Received',
      mediaUrl,
      mediaPath,
      mediaType,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('[PETORA Help] Firestore write failed for report ' + reportId)
    throw new Error('Report submit nahi ho paayi. Please try again.')
  }

  return reportId
}
