import React, { useEffect, useState } from 'react'
import logoImg from './logo.jpeg'
import { findOrganizations, listHelpRequests, submitReport, trackReport } from './api.js'

const HERO_IMG = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=1200&auto=format&fit=crop'
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop'

function Logo() {
  return (
    <a href="#home" className="brand" aria-label="PETORA Help Home">
      <span className="brand-mark has-logo" aria-hidden="true">
        <img src={logoImg} alt="PETORA logo" />
      </span>
      <span className="brand-name">
        <b>PETORA <span>Help</span></b>
        <small>Prayagraj se shuruaat</small>
      </span>
    </a>
  )
}

function ReportModal({ open, onClose }) {
  const [animal, setAnimal] = useState('Dog / Kutta')
  const [problem, setProblem] = useState('Injured / Ghayal')
  const [priority, setPriority] = useState('Normal')
  const [location, setLocation] = useState('')
  const [desc, setDesc] = useState('')
  const [phone, setPhone] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return // prevent duplicate submissions
    setError('')
    setBusy(true)
    try {
      const reportId = await submitReport(
        {
          animalType: animal,
          condition: problem,
          location,
          description: desc,
          contactNumber: phone,
          priority,
        },
        file
      )
      setDone(reportId)
    } catch (err) {
      setError(err?.message || 'Report submit nahi ho paayi. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const copyId = async () => {
    if (!done) return
    try {
      await navigator.clipboard.writeText(done)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = done
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    if (busy) return
    setDone(null); setError(''); setLocation(''); setDesc('')
    setPhone(''); setFile(null); setCopied(false)
    onClose()
  }

  return (
    <div className="overlay" onClick={reset}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>🆘 Report an Animal</h3>
            <p>Ghayal ya needy animal ki information dein.</p>
          </div>
          <button className="x" onClick={reset} aria-label="Close" disabled={busy}>✕</button>
        </div>
        <div className="modal-body">
          {!done ? (
            <form onSubmit={submit}>
              <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Animal Type</label>
                  <div className="seg">
                    {['Dog / Kutta', 'Cow / Gaay', 'Cat / Billi', 'Other'].map((a) => (
                      <button type="button" key={a} className={animal === a ? 'on' : ''} onClick={() => setAnimal(a)}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Problem</label>
                  <div className="seg">
                    {['Injured / Ghayal', 'Sick / Beemar', 'Trapped / Phansa hua', 'Abandoned / Chhoda hua', 'Aggressive / Aakramak', 'Other'].map((p) => (
                      <button type="button" key={p} className={problem === p ? 'on' : ''} onClick={() => setProblem(p)}>{p}</button>
                    ))}
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>📷 Photo / Video (optional)</label>
                  <label className="file">
                    {file ? `📎 ${file.name}` : 'Animal ki photo ya video chunein (max 15MB)'}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      hidden
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>📍 Location / Jagah</label>
                  <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Civil Lines, Prayagraj" />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Problem ke baare mein batayein</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Animal ki situation..." />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label>Contact Number</label>
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" pattern="[0-9+ ]{8,15}" />
                  </div>
                  <div className="field">
                    <label>Priority</label>
                    <div className="seg">
                      {['Normal', 'Urgent'].map((p) => (
                        <button type="button" key={p} className={priority === p ? 'on' : ''} onClick={() => setPriority(p)}>{p === 'Urgent' ? '🔴 Urgent' : 'Normal'}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>
              {error ? (
                <div className="error-box">
                  ❌ <b>Report submit nahi ho paayi.</b><br />{error}<br />Please try again.
                  <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setError('')}>Try Again</button>
                </div>
              ) : null}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} type="submit" disabled={busy}>
                {busy ? <><span className="spinner" /> Report submit ho rahi hai...</> : 'Submit Report'}
              </button>
            </form>
          ) : (
            <div className="success">
              <div className="big">❤️</div>
              <h2 style={{ margin: '12px 0 4px' }}>Report Received ❤️</h2>
              <p style={{ color: '#5d6f65', margin: 0 }}>Thank you for helping an animal.</p>
              <div className="report-id">Your Report ID<br />{done}</div>
              <p style={{ fontSize: 14, color: '#5d6f65' }}>Is Report ID ko save karke rakhein. Future mein isi ID se report status track kiya ja sakega.</p>
              <div className="copy-row">
                <button className="btn btn-outline btn-sm" onClick={copyId}>{copied ? '✓ Copied!' : '⧉ Copy Report ID'}</button>
                <button className="btn btn-primary btn-sm" onClick={reset}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TRACK_STAGES = [
  'Report Received',
  'Verified',
  'Rescue Assigned',
  'Rescue Team On The Way',
  'Animal Rescued',
  'Case Closed',
]

function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function TrackModal({ open, onClose }) {
  const [id, setId] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [report, setReport] = useState(null)

  if (!open) return null

  const lookup = async (e) => {
    e.preventDefault()
    if (busy) return // prevent duplicate requests
    setErr('')
    setBusy(true)
    try {
      setReport(await trackReport(id))
    } catch (e2) {
      setErr(e2.code || 'NETWORK')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    if (busy) return
    setId(''); setReport(null); setErr('')
    onClose()
  }

  const back = () => {
    setReport(null); setErr('')
  }

  const stageIdx = report ? TRACK_STAGES.indexOf(report.status) : -1

  return (
    <div className="overlay" onClick={reset}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>📍 Apni Report Track Karein</h3>
            <p>Report ID enter karke apni report ka current status dekhein.</p>
          </div>
          <button className="x" onClick={reset} aria-label="Close" disabled={busy}>✕</button>
        </div>
        <div className="modal-body">
          {!report ? (
            <form onSubmit={lookup}>
              <div className="field">
                <label>Report ID</label>
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value.toUpperCase())}
                  placeholder="PH-PRY-2026-XXXXX"
                  autoComplete="off"
                  disabled={busy}
                />
              </div>
              {err === 'INVALID_ID' ? (
                <div className="error-box">❌ Sahi Report ID likhein.<br />Example: PH-PRY-2026-XXXXX</div>
              ) : null}
              {err === 'NOT_FOUND' ? (
                <div className="error-box">
                  ❌ <b>Report nahi mili.</b><br />
                  Please Report ID check karke dobara try karein.
                </div>
              ) : null}
              {err === 'NETWORK' || err === 'SERVER_ERROR' ? (
                <div className="error-box">
                  ❌ Report check nahi ho paayi.<br />Please try again.
                </div>
              ) : null}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} type="submit" disabled={busy || !id.trim()}>
                {busy ? <><span className="spinner" /> Report check ho rahi hai...</> : 'Track Report'}
              </button>
            </form>
          ) : (
            <div>
              <div className="track-fields">
                <div><span>Report ID</span><b>{report.reportId}</b></div>
                <div><span>Animal Type</span><b>{report.animalType}</b></div>
                <div><span>Condition</span><b>{report.condition}</b></div>
                <div><span>Location</span><b>{report.location}</b></div>
                <div><span>Current Status</span><b className="status-now">{report.status}</b></div>
                <div><span>Submitted Date</span><b>{formatDate(report.createdAt)}</b></div>
              </div>
              {stageIdx !== -1 ? (
                <ol className="timeline">
                  {TRACK_STAGES.map((s, i) => (
                    <li key={s} className={i < stageIdx ? 'done' : i === stageIdx ? 'current' : ''}>
                      <span className="dot">{i < stageIdx ? '✓' : i === stageIdx ? '●' : '○'}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="copy-row" style={{ marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" onClick={back}>← Back</button>
                <button className="btn btn-primary btn-sm" onClick={reset}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NgoModal({ open, onClose }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [list, setList] = useState(null) // null = loading
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    setFailed(false)
    setList(null)
    const t = setTimeout(async () => {
      try {
        setList(await findOrganizations({ search, type }))
      } catch {
        setFailed(true)
        setList([])
      }
    }, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [open, search, type, attempt])

  if (!open) return null

  const reset = () => {
    setSearch(''); setType('All'); setList(null); setFailed(false)
    onClose()
  }

  return (
    <div className="overlay" onClick={reset}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>🔍 NGO / Rescuer Dhoondhein</h3>
            <p>Apne paas animal help ke liye NGO ya rescuer khojein.</p>
          </div>
          <button className="x" onClick={reset} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Area, location ya NGO ka naam search karein</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Civil Lines, Prayagraj"
              autoComplete="off"
            />
          </div>
          <div className="seg" style={{ marginBottom: 14 }}>
            {['All', 'NGO', 'Rescuer'].map((t) => (
              <button type="button" key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>

          {list === null ? (
            <p className="loading-line"><span className="spinner green" /> Khoj rahe hain...</p>
          ) : failed ? (
            <div className="error-box">
              ❌ List load nahi ho paayi.<br />Please try again.
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setAttempt((a) => a + 1)}>Try Again</button>
            </div>
          ) : list.length === 0 ? (
            <div className="ngo-empty">
              <span className="paw">🐾</span>
              <b>Abhi NGO / Rescuer listings available nahi hain.</b>
              <p>Hum verified animal-care NGOs aur rescuers ko gradually add kar rahe hain.</p>
            </div>
          ) : (
            <div className="org-list">
              {list.map((o, i) => (
                <div className="org-card" key={i}>
                  <div className="org-top">
                    <b>{o.name}</b>
                    <span className="org-type">{o.type === 'NGO' ? '🏥 NGO' : '🙋 Rescuer'}</span>
                  </div>
                  {o.verified ? <span className="verified">✓ Verified</span> : null}
                  {[o.area, o.location].filter(Boolean).join(', ') ? (
                    <p className="org-loc">📍 {[o.area, o.location].filter(Boolean).join(', ')}</p>
                  ) : null}
                  {o.description ? <p className="org-desc">{o.description}</p> : null}
                  <div className="org-actions">
                    {o.phone ? (
                      <a className="btn btn-primary btn-sm" href={`tel:${o.phone.replace(/[^+\d]/g, '')}`}>📞 Call</a>
                    ) : null}
                    {o.instagram ? (
                      <a className="btn btn-outline btn-sm" href={o.instagram} target="_blank" rel="noreferrer">📸 Instagram</a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="tiny-note" style={{ marginTop: 16 }}>
            PETORA Help khud NGO nahi hai.<br />
            Hum citizens ko verified NGOs aur rescuers se connect karte hain.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={reset}>Done</button>
        </div>
      </div>
    </div>
  )
}

const HELP_CATEGORIES = [
  ['💰', 'Financial Help'],
  ['🍚', 'Food'],
  ['🛏️', 'Beds / Blankets'],
  ['💊', 'Medicines'],
  ['👕', 'Clothes / Other Supplies'],
]

function DonateModal({ open, onClose }) {
  const [category, setCategory] = useState('')
  const [list, setList] = useState(null) // null = loading
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    setFailed(false)
    setList(null)
    let cancelled = false
    listHelpRequests({ category })
      .then((rows) => { if (!cancelled) setList(rows) })
      .catch(() => { if (!cancelled) { setFailed(true); setList([]) } })
    return () => { cancelled = true }
  }, [open, category, attempt])

  if (!open) return null

  const reset = () => {
    setCategory(''); setList(null); setFailed(false)
    onClose()
  }

  return (
    <div className="overlay" onClick={reset}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>❤️ Kaise Help Karein?</h3>
            <p>Verified NGOs ki current requirements dekhein aur apni capacity ke according help karein.</p>
          </div>
          <button className="x" onClick={reset} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="cat-grid">
            {HELP_CATEGORIES.map(([emoji, name]) => (
              <button
                type="button"
                key={name}
                className={category === name ? 'on' : ''}
                onClick={() => setCategory((c) => (c === name ? '' : name))}
              >
                <span>{emoji}</span>{name}
              </button>
            ))}
          </div>

          {list === null ? (
            <p className="loading-line"><span className="spinner green" /> Requirements dekh rahe hain...</p>
          ) : failed ? (
            <div className="error-box">
              ❌ Requirements load nahi ho paayin.<br />Please try again.
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setAttempt((a) => a + 1)}>Try Again</button>
            </div>
          ) : list.length === 0 ? (
            category ? (
              <div className="ngo-empty">
                <span className="paw">🤲</span>
                <b>No current requirements in this category.</b>
              </div>
            ) : (
              <div className="ngo-empty">
                <span className="paw">🤲</span>
                <b>Abhi koi specific requirement available nahi hai.</b>
                <p>NGOs ki verified requirements yahan update ki jayengi.</p>
                <p>PETORA Help par requirements regularly update hongi.</p>
              </div>
            )
          ) : (
            <div className="org-list">
              {list.map((r, i) => (
                <div className="org-card" key={i}>
                  <div className="org-top">
                    <b>{r.title}</b>
                    <span className={`req-status ${r.status === 'Needed' ? 'needed' : 'partial'}`}>{r.status}</span>
                  </div>
                  <p className="org-loc">🏷️ {r.category}{r.quantity ? ` • ${r.quantity}` : ''}</p>
                  <p className="org-desc">
                    <b>{r.ngoName}</b>
                    {r.ngoVerified ? <span className="verified tiny">✓ Verified NGO</span> : null}
                    {r.location ? <><br />📍 {r.location}</> : null}
                  </p>
                  {r.description ? <p className="org-desc">{r.description}</p> : null}
                  <div className="org-actions">
                    {r.phone ? (
                      <a className="btn btn-primary btn-sm" href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>📞 Call</a>
                    ) : null}
                    {r.instagram ? (
                      <a className="btn btn-outline btn-sm" href={r.instagram} target="_blank" rel="noreferrer">📸 Instagram</a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="help-steps">
            <b>Help kaise karein?</b>
            <ol>
              <li>Jo requirement aap fulfill kar sakte hain, woh choose karein.</li>
              <li>NGO ke available contact/Instagram option se connect karein.</li>
              <li>NGO se confirm karke required help provide karein.</li>
            </ol>
            <p>PETORA Help khud donation receive nahi karta.<br />Hum citizens ko NGOs ki verified requirements tak pahunchne mein help karte hain.</p>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={reset}>Done</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('hinglish')
  const [menu, setMenu] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)
  const [ngoOpen, setNgoOpen] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)

  const heroSub = lang === 'hinglish'
    ? 'Road par koi injured, sick ya needy animal dikhe? PETORA Help par report karein aur nearby NGO ya rescuer tak help pahunchayein.'
    : 'Sadak par ghayal, beemar ya sahayata ki zarurat wala pashu dikhe? PETORA Help par report karein aur najdeeki NGO ya rescuer tak madad pahunchayein.'

  const go = (id) => {
    setMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
          </nav>
          <div className="nav-right">
            <div className="lang-toggle" role="group" aria-label="Language">
              <button className={lang === 'hinglish' ? 'active' : ''} onClick={() => setLang('hinglish')}>Hinglish</button>
              <button className={lang === 'hindi' ? 'active' : ''} onClick={() => setLang('hindi')}>हिंदी</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setReportOpen(true)}>Report an Animal</button>
            <button className="hamburger" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
          </div>
        </div>
        <div className={`mobile-menu ${menu ? 'open' : ''}`}>
          <a href="#home" onClick={(e) => { e.preventDefault(); go('home') }}>Home</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); go('about') }}>About</a>
        </div>
      </header>

      <main className="container" id="home">
        {/* HERO */}
        <section className="hero">
          <div className="hero-grid">
            <div>
              <span className="pill">🌿 Prayagraj se shuruaat</span>
              <h1 className="serif">Kisi Jaanwar Ko Help Chahiye?</h1>
              <p className="lead">{heroSub}</p>
              <button className="btn btn-primary" onClick={() => setReportOpen(true)}>🆘 Report an Animal</button>
            </div>
            <div className="hero-photo">
              <img
                src={HERO_IMG}
                alt="A person caring for a rescued animal"
                loading="lazy"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fbk) {
                    e.currentTarget.dataset.fbk = '1'
                    e.currentTarget.src = HERO_FALLBACK
                  } else {
                    e.currentTarget.style.display = 'none'
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* THREE MAIN ACTIONS */}
        <section className="section">
          <div className="actions">
            <div className="action-card report">
              <span className="icon">🆘</span>
              <h3>Report an Animal</h3>
              <p>Ghayal ya needy animal ki information dein.</p>
              <button className="btn btn-accent" onClick={() => setReportOpen(true)}>Report Now</button>
            </div>
            <div className="action-card">
              <span className="icon">📍</span>
              <h3>Find NGO / Rescuer</h3>
              <p>Apne paas animal-care NGO ya rescuer khojein.</p>
              <button className="btn btn-primary" onClick={() => setNgoOpen(true)}>Find Help</button>
            </div>
            <div className="action-card">
              <span className="icon">❤️</span>
              <h3>Donate / Help</h3>
              <p>NGO ki requirement ke according madad karein.</p>
              <button className="btn btn-primary" onClick={() => setDonateOpen(true)}>Help an NGO</button>
            </div>
          </div>
          <p className="track-link">
            📍 Report submit ki thi? <button type="button" onClick={() => setTrackOpen(true)}>Track Report →</button>
          </p>
        </section>

        {/* BAS 3 STEPS */}
        <section className="steps-strip" aria-label="Bas 3 Steps">
          <b className="steps-title">Bas 3 Steps</b>
          <div className="steps-items">
            <span><i>01</i> 🐾 Animal dekha</span>
            <em>→</em>
            <span><i>02</i> 📝 PETORA Help par report kiya</span>
            <em>→</em>
            <span><i>03</i> 🤝 NGO / Rescuer se connect hue</span>
          </div>
        </section>

        {/* WHAT IS PETORA HELP */}
        <section className="about" id="about">
          <h2 className="serif">PETORA Help kya hai?</h2>
          <p>Hum citizens ko animal NGOs aur rescuers se connect karte hain, taaki kisi needy animal ko dekhkar log confused na rahein ki help kahan se milegi.</p>
        </section>

        {/* NGO EMPTY STATE */}
        <section className="section" id="ngos">
          <div className="section-head">
            <h2 className="serif">Prayagraj ke NGOs & Rescuers</h2>
            <p>Verified local organizations ki information yahan milegi.</p>
          </div>
          <div className="ngo-empty">
            <span className="paw">🐾</span>
            <b>NGO listings coming soon</b>
            <p>PETORA Help admins verified local NGO information add karenge.</p>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="container footer-inner">
          <div>
            <b>PETORA Help</b>
            <p>Together for their better tomorrow.</p>
          </div>
          <nav>
            <a href="#home" onClick={(e) => { e.preventDefault(); go('home') }}>Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); go('about') }}>About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); go('contact') }}>Contact</a>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© PETORA Help</span>
          <span className="social-note">
            <a href="https://www.instagram.com/pectora_help/" target="_blank" rel="noreferrer">📸 Instagram: @pectora_help</a>
            <span className="sep">•</span>
            <span>Website developed by <a href="https://www.instagram.com/aman_ac_1025/" target="_blank" rel="noreferrer">Aman</a></span>
          </span>
        </div>
      </footer>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <TrackModal open={trackOpen} onClose={() => setTrackOpen(false)} />
      <NgoModal open={ngoOpen} onClose={() => setNgoOpen(false)} />
      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </>
  )
}
