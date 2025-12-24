const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const IN = path.join(SEEDS, 'techniques.json')

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: node export_seed_to_csv.js <rawFileName>')
  process.exit(1)
}

const rawFile = arg
const techniques = JSON.parse(fs.readFileSync(IN, 'utf8'))
const rows = techniques
  .filter(t => t.rawFile === rawFile)
  .map(t => ({ slug: t.slug, name: t.name, rank: t.rank || '' }))

if (rows.length === 0) {
  console.log('No techniques found for', rawFile)
  process.exit(0)
}

console.log('slug,name,rank')
rows.forEach(r => {
  const esc = s => '"' + (s || '').replace(/"/g, '""') + '"'
  console.log([r.slug, esc(r.name), esc(r.rank)].join(','))
})
