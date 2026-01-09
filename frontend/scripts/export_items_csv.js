const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const IN = path.join(SEEDS, 'items.json')

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: node export_items_csv.js <rawFileName>')
  process.exit(1)
}

const rawFile = arg
const items = JSON.parse(fs.readFileSync(IN, 'utf8'))
const rows = items
  .filter(i => i.rawFile === rawFile)
  .map(i => ({ slug: i.slug, name: i.name, category: i.category, rank: i.rank, description: i.description }))

if (rows.length === 0) {
  console.log('No items found for', rawFile)
  process.exit(0)
}

console.log('slug,name,category,rank,description')
rows.forEach(r => {
  const esc = s => '"' + (s || '').replace(/"/g, '""') + '"'
  console.log([r.slug, esc(r.name), esc(r.category), r.rank, esc(r.description)].join(','))
})
