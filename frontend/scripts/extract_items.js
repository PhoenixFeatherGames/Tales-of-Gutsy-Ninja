const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const OUT = path.join(SEEDS, 'items.json')

function stripBrackets(s) {
  return s.replace(/\[([^\]]+)\]/g, (m, p) => {
    if (p.indexOf('|') !== -1) return p.split('|')[0]
    if (/^[A-Za-z]{1,3}$/.test(p.trim())) return ''
    return p
  }).trim()
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const files = fs.readdirSync(SEEDS).filter(f => f.endsWith('.json') && f !== 'index.json')
const items = []

files.forEach(file => {
  const full = path.join(SEEDS, file)
  const obj = JSON.parse(fs.readFileSync(full, 'utf8'))
  if (!obj || typeof obj.content !== 'string') return

  const lines = obj.content.split(/\r?\n/)
  let currentSection = null
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw || !raw.trim()) continue

    // section header detection
    const mh = raw.match(/^>\s*(?:\[[^\]]+\]\s*)*(.+)$/)
    if (mh) {
      currentSection = stripBrackets(mh[1]).trim()
      continue
    }

    // item line detection: "Name <desc> | RANK"
    const m = raw.match(/^\s*(.+?)\s*(?:<([^>]+)>)?\s*\|\s*([A-S][+-]?)(.*)$/i)
    if (m) {
      const nameRaw = stripBrackets(m[1])
      const desc = (m[2] || '') + ' ' + (m[4] || '')
      const rank = m[3].toUpperCase()
      const name = nameRaw.trim()
      const slug = slugify(name)
      items.push({ slug, name, category: currentSection || 'items', rank, description: desc.trim(), rawFile: obj.rawFile })
      continue
    }

    // sometimes lines have two items separated by a newline or comma - skip complex cases for now
  }
})

fs.writeFileSync(OUT, JSON.stringify(items, null, 2), 'utf8')
console.log('Wrote', items.length, 'items to', OUT)
