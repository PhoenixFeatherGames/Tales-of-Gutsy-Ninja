const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const outPath = path.join(SEEDS, 'villages.json')

function parseContent(content) {
  const lines = content.split(/\r?\n/)
  const data = {}
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line.startsWith('> ')) {
      const key = line.replace(/^>\s*/, '').trim()
      i++
      const values = []
      while (i < lines.length && !lines[i].trim().startsWith('> ')) {
        if (lines[i].trim()) values.push(lines[i].trim())
        i++
      }
      data[key] = values.join('\n')
    } else {
      // capture intro/description until first header
      const intro = []
      while (i < lines.length && !lines[i].trim().startsWith('> ')) {
        if (lines[i].trim()) intro.push(lines[i].trim())
        i++
      }
      if (intro.length) data['description'] = (data['description'] ? data['description'] + '\n' : '') + intro.join('\n')
    }
  }
  return data
}

const files = fs.readdirSync(SEEDS).filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'villages.json')
const villages = []

files.forEach(file => {
  const full = path.join(SEEDS, file)
  const json = JSON.parse(fs.readFileSync(full, 'utf8'))
  const parsed = parseContent(json.content)

  // Normalize fields
  const getList = (key) => {
    if (!parsed[key]) return []
    return parsed[key].split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
  }

  const jutsuAffinity = {}
  if (parsed['Jutsu Affinity']) {
    const lines = parsed['Jutsu Affinity'].split(/\n+/)
    lines.forEach(l => {
      const m = l.match(/^([^|]+)\s*\|\s*\+?(\d+)/)
      if (m) jutsuAffinity[m[1].trim()] = Number(m[2])
    })
  }

  const village = {
    slug: json.slug,
    name: json.title,
    description: parsed['description'] || '',
    leader: (parsed['Kazekage'] || parsed['Raikage'] || parsed['Tsuchikage'] || parsed['Hokage'] || parsed['Summit Leader'] || '').trim(),
    retainer: (parsed['Retainer'] || '').trim(),
    population: (parsed['Population'] || '').replace(/,/g, '').trim() || null,
    treasury: (parsed['Treasury'] || '').trim() || null,
    clans: getList('Clans'),
    natureAffinity: getList('Nature Affinity'),
    jutsuAffinity: jutsuAffinity,
    rawFile: json.rawFile
  }

  villages.push(village)
})

fs.writeFileSync(outPath, JSON.stringify(villages, null, 2), 'utf8')
console.log('Wrote', villages.length, 'villages to', outPath)
