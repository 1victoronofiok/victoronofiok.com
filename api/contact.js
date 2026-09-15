// Vercel Serverless Function — POST /api/contact
// Sends the contact form to CONTACT_TO via the Resend API.
//
// Required env var: RESEND_API_KEY
// Optional:         CONTACT_TO, CONTACT_FROM

const TO = process.env.CONTACT_TO
const FROM = process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>'

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  )

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return res.status(500).json({ error: 'Mail is not configured yet. Email me directly instead.' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid request body.' })
    }
  }

  const name = (body?.name || '').toString().trim()
  const email = (body?.email || '').toString().trim()
  const message = (body?.message || '').toString().trim()
  const linkedin = (body?.linkedin || '').toString().trim().slice(0, 300)
  const honeypot = (body?.company || '').toString().trim()

  if (honeypot) return res.status(200).json({ ok: true }) // silently drop bots

  if (!name || !email || !message || !linkedin) {
    return res.status(400).json({ error: 'Name, email, LinkedIn and message are all required.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look right.' })
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: 'That is a bit too long — trim it down and resend.' })
  }

  // The field accepts a bare "linkedin.com/in/x", so add a scheme before validating it.
  let linkedinUrl = ''
  try {
    const u = new URL(/^https?:\/\//i.test(linkedin) ? linkedin : `https://${linkedin}`)
    if ((u.protocol === 'http:' || u.protocol === 'https:') && /linkedin\./i.test(u.hostname)) {
      linkedinUrl = u.href
    }
  } catch {
    linkedinUrl = ''
  }
  if (!linkedinUrl) {
    return res.status(400).json({ error: 'That does not look like a LinkedIn profile URL.' })
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `Portfolio — ${name}`,
        text: `From: ${name} <${email}>\nLinkedIn: ${linkedinUrl}\n\n${message}`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
            <p style="margin:0 0 4px"><strong>${esc(name)}</strong></p>
            <p style="margin:0 0 4px"><a href="mailto:${esc(email)}" style="color:#111">${esc(email)}</a></p>
            <p style="margin:0 0 20px"><a href="${esc(linkedinUrl)}" style="color:#111">${esc(linkedinUrl)}</a></p>
            <div style="border-left:3px solid #e4e4e6;padding-left:16px;white-space:pre-wrap">${esc(message)}</div>
            <p style="margin-top:28px;font-size:12px;color:#8a8a90">Sent from victoronofiok.com</p>
          </div>
        `,
      }),
    })

    if (!r.ok) {
      const detail = await r.text()
      console.error('Resend error', r.status, detail)
      return res.status(502).json({ error: 'Could not send that right now. Try again in a moment.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact handler failed', err)
    return res.status(500).json({ error: 'Something broke on my end. Try again shortly.' })
  }
}
