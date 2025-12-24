const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const IN = path.join(SEEDS, 'summons.json')

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: node export_summons_csv.js <rawFileName>')
  process.exit(1)
}

const rawFile = arg
const summons = JSON.parse(fs.readFileSync(IN, 'utf8'))
const rows = summons
  .filter(s => s.rawFile === rawFile)
  .map(s => ({ slug: s.slug, name: s.name, sizes: JSON.stringify(s.sizes || {}), jutsuRule: s.jutsuRule }))

if (rows.length === 0) {
  console.log('No summons found for', rawFile)
  process.exit(0)
}

console.log('slug,name,sizes,jutsuRule')
rows.forEach(r => {
  const esc = s => '"' + (s || '').replace(/"/g, '""') + '"'
  console.log([r.slug, esc(r.name), esc(r.sizes), esc(r.jutsuRule)].join(','))
})
