import { useState } from 'react'

const PRODUCTS = [
  {
    n: '01',
    name: 'macOS Agentic Cleaner',
    status: 'In development',
    desc:
      'A local agent that understands what is actually on your Mac — caches, orphaned builds, the 40GB of Docker layers you forgot about — and clears it without you auditing a single folder. It asks before it deletes. Always.',
  },
  {
    n: '02',
    name: 'Agentic Ingestion',
    status: 'In development',
    desc:
      'The ingestion layer AI agents and workflows are missing. Point it at messy sources — documents, APIs, half-structured exports — and it returns clean, chunked, retrieval-ready context. No bespoke parser per source.',
  },
]

function scrollTo(e, id) {
  e.preventDefault()
  const el = typeof document !== 'undefined' && document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top" onClick={(e) => scrollTo(e, 'top')} aria-label="Victor Onofiok — home">
        <img src="/face.jpg" alt="Portrait of Victor Onofiok" width="40" height="40" />
        <span className="brand-name">Victor Onofiok</span>
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#products" className="link" onClick={(e) => scrollTo(e, 'products')}>
          Products
        </a>
        <a href="#contact" className="btn-contact" onClick={(e) => scrollTo(e, 'contact')}>
          Contact
        </a>
      </nav>
    </header>
  )
}

function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-heading">
      <p className="eyebrow">EMEA</p>
      <h1 id="intro-heading">
        Senior Software Engineer <span className="amp">&amp;</span> Architect
      </h1>
      <div className="lede">
        <p>
          Software Engineer with 6 years of experience building full-stack products.
          B.Sc. Computer Science, University of Lagos.
          <strong>Engineering Founder at Ovulabs</strong>, a startup building security infrastructure in
          Nigeria &mdash;.
        </p>
      </div>
    </section>
  )
}

function Products() {
  return (
    <section className="products" id="products" aria-labelledby="products-heading">
      <p className="eyebrow">Products</p>
      <h2 id="products-heading">Things I&rsquo;m building</h2>
      <ol className="product-list">
        {PRODUCTS.map((p) => (
          <li key={p.n} className="product">
            <span className="product-n" aria-hidden="true">
              {p.n}
            </span>
            <div className="product-body">
              <h3>
                {p.name}
                <span className="status">{p.status}</span>
              </h3>
              <p>{p.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Contact() {
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (state === 'sending') return
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    if (data.company) return // honeypot
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Something went wrong. Try again?')
      form.reset()
      setState('sent')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  return (
    <section className="contact" id="contact" aria-labelledby="contact-heading">
      <p className="eyebrow">Contact</p>
      <h2 id="contact-heading">Say hello</h2>
      <p className="contact-note">
        Recruiting (full-time or contract), product enquiries. All of it lands in the same inbox.
      </p>

      <form className="form" onSubmit={onSubmit} noValidate={false}>
        <div className="row">
          <label className="field">
            <span>Name</span>
            <input type="text" name="name" required autoComplete="name" placeholder="Your name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required autoComplete="email" placeholder="email@mail.com" />
          </label>
        </div>
        <label className="field">
          <span>LinkedIn</span>
          <input
            type="text"
            name="linkedin"
            required
            autoComplete="url"
            inputMode="url"
            placeholder="linkedin.com/in/yourprofile"
          />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea name="message" rows="5" required placeholder="recruiting for.." />
        </label>

        <input
          type="text"
          name="company"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          className="hp"
        />

        <div className="form-footer">
          <button type="submit" className="btn-submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p className="form-status" role="status" aria-live="polite">
            {state === 'sent' && 'Sent. I’ll get back to you shortly.'}
            {state === 'error' && error}
          </p>
        </div>
      </form>
    </section>
  )
}

export default function App() {
  return (
    <div className="page" id="top">
      <Nav />
      <main>
        <Intro />
        <hr className="rule" />
        <Products />
        <hr className="rule" />
        <Contact />
      </main>
      <footer className="footer">
        <span>&copy; 2024 Victor Onofiok</span>
      </footer>
    </div>
  )
}
