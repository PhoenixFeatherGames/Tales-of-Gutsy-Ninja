const fs = require('fs')
const path = require('path')

const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const OUT = path.join(SEEDS, 'techniques.json')

function nextNonEmpty(lines, i) {
  i++
  while (i < lines.length && !lines[i].trim()) i++
  return { idx: i, line: lines[i] ? lines[i].trim() : '' }
}

function stripBrackets(s) {
  return s.replace(/\[([^\]]+)\]/g, (m, p) => {
    if (p.indexOf('|') !== -1) return p.split('|')[0]
    if (/^[A-Za-z]{1,3}$/.test(p.trim())) return ''
    return p
  }).trim()
}

const files = fs.readdirSync(SEEDS).filter(f => f.endsWith('.json') && f !== 'index.json')
const techniques = []

files.forEach(file => {
  const full = path.join(SEEDS, file)
  const obj = JSON.parse(fs.readFileSync(full, 'utf8'))
  if (!obj || typeof obj.content !== 'string') return
  // skip files that do not look like technique documents
  const looksLikeTechnique = /\[Bc\]Rank/i.test(obj.content) || /Rank:/i.test(obj.content) || obj.type === 'rule'
  if (!looksLikeTechnique) {
    console.log('Skipping (no rank):', file)
    return
  }
  let addedCount = 0
  const lines = obj.content.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw || !raw.trim()) continue

    // header detection: lines converted into '> Name' by parser, possibly with short tags
    const m = raw.match(/^>\s*(?:\[[^\]]+\]\s*)*(.+)$/)
    if (m) {
      const name = stripBrackets(m[1])
      if (!name) continue
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const tech = { slug, name, rank: null, technique: null, element: null, prerequisite: null, cost: null, description: '', rawFile: obj.rawFile }

      // parse subsequent lines until next header
      let j = i + 1
      while (j < lines.length) {
        const l = lines[j].trim()
        if (!l) { j++; continue }
        if (/^>\s*/.test(l)) break // next header

        const cleaned = stripBrackets(l)
        if (/^Rank\b/i.test(cleaned)) {
          const next = nextNonEmpty(lines, j)
          tech.rank = stripBrackets(next.line)
          j = next.idx
          continue
        }
        if (/^Technique\b/i.test(cleaned)) {
          const next = nextNonEmpty(lines, j)
          tech.technique = stripBrackets(next.line)
          j = next.idx
          continue
        }
        if (/^Element\b/i.test(cleaned)) {
          const next = nextNonEmpty(lines, j)
          tech.element = stripBrackets(next.line)
          j = next.idx
          continue
        }
        if (/^Prerequis/i.test(cleaned)) {
          const next = nextNonEmpty(lines, j)
          tech.prerequisite = stripBrackets(next.line)
          j = next.idx
          continue
        }
        if (/^Cost\b/i.test(cleaned)) {
          const next = nextNonEmpty(lines, j)
          tech.cost = stripBrackets(next.line)
          j = next.idx
          continue
        }
        if (/^Description\b/i.test(cleaned) || /^Description:/i.test(l) ) {
          // collect description paragraphs until blank or next label/header
          const parts = []
          let k = j + 1
          while (k < lines.length) {
            const tk = lines[k].trim()
            if (!tk) { k++; continue }
            if (/^>\s*/.test(tk)) break
            if (/^(Rank|Technique|Element|Prerequis|Cost)\b/i.test(stripBrackets(tk))) break
            parts.push(stripBrackets(tk))
            k++
          }
          tech.description = parts.join('\n')
          j = k
          continue
        }

        // fallback: sometimes labels are on separate lines like '[c]E-Rank, Active'
        // attempt to capture unlabeled description lines
        j++
      }

      techniques.push(tech)
      addedCount++
      i = j - 1
    }
  }
  console.log('Processed', file + ':', addedCount, 'added')
})

fs.writeFileSync(OUT, JSON.stringify(techniques, null, 2), 'utf8')
console.log('Wrote', techniques.length, 'techniques to', OUT)
