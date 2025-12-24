#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const RAW = path.join(__dirname, '..', 'docs', 'raw')
const OUT = path.join(__dirname, '..', 'docs', 'normalized')
const SEEDS = path.join(__dirname, '..', 'data', 'seeds')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

ensureDir(RAW)
ensureDir(OUT)
ensureDir(SEEDS)

function convertMarkup(content) {
  // Normalize newlines
  let text = content.replace(/\r\n?/g, '\n')

  // Inline tags [b]...[/b], [i]...[/i], [s]...[/s], [c]...[/c]
  text = text.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '**$1**')
  text = text.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '*$1*')
  text = text.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '~~$1~~')
  text = text.replace(/\[c\]([\s\S]*?)\[\/c\]/gi, (_, m) => `<p align="center">${m.trim()}</p>`)

  // Line-level tags: if a line starts with [b] [i] [s] [c]
  text = text.split('\n').map(line => {
    const trimmed = line.trim()
    if (/^\[b\]/i.test(trimmed)) return '**' + trimmed.replace(/^\[b\]/i, '').trim() + '**'
    if (/^\[i\]/i.test(trimmed)) return '*' + trimmed.replace(/^\[i\]/i, '').trim() + '*'
    if (/^\[s\]/i.test(trimmed)) return '~~' + trimmed.replace(/^\[s\]/i, '').trim() + '~~'
    if (/^\[c\]/i.test(trimmed)) return `<p align="center">${trimmed.replace(/^\[c\]/i, '').trim()}</p>`
    // Visual scroll markers [|] -> blockquote-style line
    if (/\[\|\]/.test(trimmed)) return '> ' + trimmed.replace(/\[\|\]/g, '').trim()
    return line
  }).join('\n')

  return text
}

function inferType(text) {
  const lower = text.toLowerCase()
  if (lower.includes('village') || lower.includes('population') || lower.includes('treasury')) return 'village'
  if (lower.includes('clan') || lower.includes('bloodline') || lower.includes('blood')) return 'clan'
  if (lower.includes('rule') || lower.includes('rules') || lower.includes('mission')) return 'rule'
  return 'doc'
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const files = fs.readdirSync(RAW).filter(f => !f.startsWith('.'))
const index = []

files.forEach(file => {
  const full = path.join(RAW, file)
  const raw = fs.readFileSync(full, 'utf8')
  const converted = convertMarkup(raw)

  // Write normalized markdown
  const outName = file.replace(/\.[^.]+$/, '') + '.md'
  const outPath = path.join(OUT, outName)
  fs.writeFileSync(outPath, converted, 'utf8')

  // Extract a title (first heading or first non-empty line)
  const lines = converted.split('\n')
  let title = ''
  for (const l of lines) {
    const h = l.trim()
    if (!h) continue
    if (/^#\s+/.test(h)) { title = h.replace(/^#\s+/, '').trim(); break }
    title = h.replace(/^>\s*/, '').trim(); break
  }
  if (!title) title = file.replace(/\.[^.]+$/, '')

  const type = inferType(converted)
  const slug = slugify(title || file)

  const meta = { slug, title, type, file: outName, rawFile: file }
  index.push(meta)

  // Also write a JSON version for seeds (full content + metadata)
  const jsonOut = path.join(SEEDS, slug + '.json')
  fs.writeFileSync(jsonOut, JSON.stringify({ ...meta, content: converted }, null, 2), 'utf8')
})

fs.writeFileSync(path.join(SEEDS, 'index.json'), JSON.stringify(index, null, 2), 'utf8')

console.log('Converted', files.length, 'file(s).')
console.log('Index written to data/seeds/index.json')
