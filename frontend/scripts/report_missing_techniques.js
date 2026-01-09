const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const OUT = path.join(SEEDS, 'techniques.json')

function stripBrackets(s) {
  return s.replace(/\[([^\]]+)\]/g, (m, p) => {
    if (p.indexOf('|') !== -1) return p.split('|')[0]
    if (/^[A-Za-z]{1,3}$/.test(p.trim())) return ''
    return p
  }).trim()
}

function extractFromContent(content) {
  const lines = content.split(/\r?\n/)
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw || !raw.trim()) continue
    const m = raw.match(/^>\s*(?:\[[^\]]+\]\s*)*(.+)$/)
    if (m) {
      const name = stripBrackets(m[1])
      if (!name) continue
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      out.push({ slug, name })
    }
  }
  return out
}

const files = fs.readdirSync(SEEDS).filter(f => f.endsWith('.json') && f !== 'index.json')
let canonical = []
try { canonical = JSON.parse(fs.readFileSync(OUT, 'utf8')) } catch (e) { console.error('Could not load canonical techniques', e.message) }
const canonicalSlugs = new Set(canonical.map(t => t.slug))

files.forEach(file => {
  const full = path.join(SEEDS, file)
  const obj = JSON.parse(fs.readFileSync(full, 'utf8'))
  if (!obj || typeof obj.content !== 'string') return
  const looksLikeTechnique = /\[Bc\]Rank/i.test(obj.content) || /Rank:/i.test(obj.content) || obj.type === 'rule'
  if (!looksLikeTechnique) return

  const extracted = extractFromContent(obj.content)
  const missing = extracted.filter(e => !canonicalSlugs.has(e.slug))
  if (extracted.length === 0) return
  console.log(`File: ${file} — extracted ${extracted.length}, missing ${missing.length}`)
  if (missing.length) console.log('  Missing:', missing.map(m => m.slug).join(', '))
})

console.log('Done')
