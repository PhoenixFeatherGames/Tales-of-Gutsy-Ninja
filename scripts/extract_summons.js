const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const OUT = path.join(SEEDS, 'summons.json')

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
const summons = []

files.forEach(file => {
  const full = path.join(SEEDS, file)
  const obj = JSON.parse(fs.readFileSync(full, 'utf8'))
  if (!obj || typeof obj.content !== 'string') return

  const content = obj.content
  // Heuristic: files that describe Shōkan/shokan/summons
  if (!/sh[oō]kan|summon/i.test(content)) return

  // create a single summon document per seed (for now)
  const name = obj.title || file.replace(/\.json$/, '')
  const slug = slugify(name)
  const description = stripBrackets(content)

  // attempt to extract size per rank heuristics
  const sizes = {}
  const sizeRegex = /(D|C|B|A|S)(?:-?\+?)?[-\s]*Rank[^\n]*tops?\s?at\s?(\d+\s?m)/ig
  let m
  while ((m = sizeRegex.exec(content))) {
    sizes[m[1]] = m[2]
  }

  // jutsu bank / gear rules capture (simple heuristics)
  const jutsuMatch = content.match(/(Jutsu Bank[^\n]*)/i)
  const jutsuRule = jutsuMatch ? jutsuMatch[1] : ''

  summons.push({ slug, name, description, sizes, jutsuRule, rawFile: obj.rawFile })
})

fs.writeFileSync(OUT, JSON.stringify(summons, null, 2), 'utf8')
console.log('Wrote', summons.length, 'summons to', OUT)
