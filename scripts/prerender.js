// Renders <App /> to static HTML at build time and injects it into dist/index.html
// so crawlers (and anyone with JS off) get the real content, not an empty div.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const serverDir = path.join(dist, 'server')
const htmlPath = path.join(dist, 'index.html')

const entry = ['entry-server.js', 'entry-server.mjs']
  .map((f) => path.join(serverDir, f))
  .find((f) => fs.existsSync(f))

if (!entry) {
  console.error('[prerender] SSR bundle not found in dist/server — skipping.')
  process.exit(1)
}

const { render } = await import(pathToFileURL(entry).href)
const appHtml = render()

let html = fs.readFileSync(htmlPath, 'utf8')
if (!html.includes('<div id="root"></div>')) {
  console.error('[prerender] could not find empty #root in dist/index.html')
  process.exit(1)
}
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
fs.writeFileSync(htmlPath, html)

fs.rmSync(serverDir, { recursive: true, force: true })
console.log(`[prerender] injected ${appHtml.length} bytes of static HTML into dist/index.html`)
