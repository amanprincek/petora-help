import React, { useState } from 'react'
import logoImg from './logo.jpeg'

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
  const [done, setDone] = useState(null)

  if (!open) return null

  const submit = (e) => {
    e.preventDefault()
    const id = `PH-PRY-2026-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}${Math.floor(Math.random() * 10)}`
    setDone(id)
  }

  const reset = () => {
    setDone(null); setLocation(''); setDesc(''); setPhone('')
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
          <button className="x" onClick={reset} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {!done ? (
            <form onSubmit={submit}>
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
                  {['Injured / Ghayal', 'Sick / Beemar', 'Trapped', 'Abandoned', 'Other'].map((p) => (
                    <button type="button" key={p} className={problem === p ? 'on' : ''} onClick={() => setProblem(p)}>{p}</button>
                  ))}
                </div>
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
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} type="submit">Submit Report</button>
            </form>
          ) : (
            <div className="success">
              <div className="big">✅</div>
              <h2 style={{ margin: '12px 0 4px' }}>Report Received</h2>
              <p style={{ color: '#5d6f65', margin: 0 }}>Thank you for helping an animal.</p>
              <div className="report-id">Your Report ID<br />{done}</div>
              <p style={{ fontSize: 14, color: '#5d6f65' }}>Is ID ko future tracking ke liye save karein.</p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={reset}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('hinglish')
  const [menu, setMenu] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

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
              <button className="btn btn-primary" onClick={() => go('ngos')}>Find Help</button>
            </div>
            <div className="action-card">
              <span className="icon">❤️</span>
              <h3>Donate / Help</h3>
              <p>NGO ki requirement ke according madad karein.</p>
              <button className="btn btn-primary" onClick={() => go('ngos')}>Help an NGO</button>
            </div>
          </div>
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
            <p>Prayagraj se shuruaat.</p>
          </div>
          <nav>
            <a href="#home" onClick={(e) => { e.preventDefault(); go('home') }}>Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); go('about') }}>About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); go('contact') }}>Contact</a>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© PETORA Help</span>
          <span className="social-note">📸 Instagram • 📘 Facebook — coming soon</span>
        </div>
      </footer>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  )
}
