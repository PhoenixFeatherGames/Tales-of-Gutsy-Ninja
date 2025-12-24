const fs = require('fs')
const path = require('path')

const RAW = path.join(__dirname, '..', 'docs', 'raw')
const SEEDS = path.join(__dirname, '..', 'data', 'seeds')
const OUT = path.join(SEEDS, 'clans.json')

function nextNonEmpty(lines, i) {
  i++
  while (i < lines.length && !lines[i].trim()) i++
  return { idx: i, line: lines[i] ? lines[i].trim() : '' }
}

function stripBrackets(s) {
  // Replace bracketed tokens:
  // - If token contains a pipe like [Name|url], replace with 'Name'
  // - If token is a short markup tag like [C], [Bc], [Bcu], remove it entirely
  // - Otherwise, replace with the content
  return s.replace(/\[([^\]]+)\]/g, (m, p) => {
    if (p.indexOf('|') !== -1) return p.split('|')[0]
    if (/^[A-Za-z]{1,3}$/.test(p.trim())) return ''
    return p
  }).trim()
}

function parseSkillLine(line) {
  // e.g. +5 Shikotsumyaku, +2 Taijutsu
  const parts = line.split(/[,;]+/).map(p => p.trim()).filter(Boolean)
  const map = {}
  parts.forEach(p => {
    const m = p.match(/([+-]?\d+)\s*(.*)/)
    if (m) {
      map[m[2].trim()] = Number(m[1])
    } else {
      map[p] = null
    }
  })
  return map
}

const files = fs.readdirSync(RAW).filter(f => f.endsWith('.txt'))
const clans = []

files.forEach(file => {
  const raw = fs.readFileSync(path.join(RAW, file), 'utf8')
  // Split into blocks by occurrences of [Bcu] or [Bcu][|]...
  // We'll detect clan headers by lines that contain [|] and a short name
  const lines = raw.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    // clan header pattern: contains [|] and either a clan marker on the same line
    // or the next non-empty line contains the 'Village' label (common pattern)
    const next = nextNonEmpty(lines, i)
    if (/\[\|\]/.test(line) && ( /\[bcu\]|\[bc\]/i.test(line) || (/Village/i.test(next.line) && next.idx > i) ) && line.length < 200) {
      // Extract name from line
      const name = stripBrackets(line.replace(/\[\|\]/g, ''))
      // heuristics: skip obvious village documents (they often have Population/Treasury labels)
      const lookahead = lines.slice(i, Math.min(i + 12, lines.length)).join(' ')
      if (/village/i.test(name) || /hidden/i.test(name) || /(Population|Treasury|Founding|Capital)/i.test(lookahead)) {
        continue
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const clan = { slug, name, village: null, skillProficiencies: {}, ability: '', chakraNatures: [], rawFile: file }

      // parse following lines for fields
      let j = i + 1
      while (j < lines.length && !(/\[\|\]/.test(lines[j]))) {
        const l = lines[j].trim()
        if (!l) { j++; continue }

        // detect labels
        if (/Village/i.test(l)) {
          const next = nextNonEmpty(lines, j)
          // if the line contains a bracket with a pipe, extract the display text before the pipe
          // prefer a bracket that includes a pipe like [Name|url]
          let m = next.line.match(/\[([^\]]+)\|[^\]]*\]/)
          if (m) {
            clan.village = m[1].trim()
          } else {
            // otherwise pick the first bracket token that isn't a short markup tag
            const all = [...next.line.matchAll(/\[([^\]]+)\]/g)].map(x => x[1])
            const pick = all.find(t => !/^[A-Za-z]{1,3}$/.test(t.trim()))
            clan.village = pick ? pick.trim() : stripBrackets(next.line)
          }
          j = next.idx
          continue
        }

        if (/Skill Proficiencies/i.test(l)) {
          const next = nextNonEmpty(lines, j)
          clan.skillProficiencies = parseSkillLine(stripBrackets(next.line))
          j = next.idx
          continue
        }

        if (/Clan Ability/i.test(l)) {
          // capture ability block until we hit another known label or the next header
          let k = j + 1
          const parts = []
          while (k < lines.length) {
            const tk = lines[k].trim()
            if (!tk) { k++; continue }
            // stop if we reach the next header or another major label
            if (/\[\|\]/.test(tk) || /(Skill Proficiencies|Chakra Natures|Village|Family Tree|Sensory Type)/i.test(tk)) break
            parts.push(stripBrackets(tk))
            k++
          }
          clan.ability = parts.join('\n')
          j = k
          continue
        }

        if (/Chakra Natures/i.test(l)) {
          const next = nextNonEmpty(lines, j)
          const list = stripBrackets(next.line).replace(/，/g, ',').replace(/、/g, ',')
          clan.chakraNatures = list.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
          j = next.idx
          continue
        }

        // fallback: sometimes skill lines are just next to label without label token
        j++
      }

      clans.push(clan)
    }
  }
})

fs.writeFileSync(OUT, JSON.stringify(clans, null, 2), 'utf8')
console.log('Wrote', clans.length, 'clans to', OUT)
