const fs = require('fs');
const path = require('path');

const infile = path.join(__dirname, '..', 'data', 'seeds', 'techniques.json');
const outfile = path.join(__dirname, '..', 'data', 'seeds', 'techniques.normalized.json');

function stripHtml(s) {
  if (s == null) return null;
  // remove tags
  let t = s.replace(/<[^>]+>/g, '');
  // decode a few common entities
  t = t.replace(/&nbsp;/g, ' ')
       .replace(/&amp;/g, '&')
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'");
  // collapse spaces
  t = t.replace(/\s+/g, ' ').trim();
  return t === '' ? null : t;
}

function parseRank(s) {
  if (!s) return [];
  // split on commas and normalize B-, D-, etc.
  const parts = s.split(',').map(p => p.trim()).filter(Boolean);
  return parts.map(tok => tok.replace(/-Rank$/i, '').replace(/Active|Passive|Reactive|Reaction/i, m=>m).trim());
}

function parseElement(s) {
  if (!s) return [];
  const cleaned = s.replace(/N\/?A/i, '').trim();
  if (!cleaned) return [];
  return cleaned.split(',').map(p => p.trim()).filter(Boolean);
}

function parseCost(s) {
  if (!s) return null;
  // try to capture first number and unit
  const m = s.match(/(\d+)(?:\s*[-–—]?\s*(Chakra Points|ChP|ChakraPoints|Evasion Points|EP|oz|Per Round|Per Minute|Per 5 Meters|Per Jump|per round|per minute|per jump|per 5))/i);
  if (m) {
    return { amount: parseInt(m[1], 10), unit: m[2].replace(/\s+/g, ' ') };
  }
  // fallback: find any number
  const m2 = s.match(/(\d+)/);
  if (m2) return { amount: parseInt(m2[1], 10), unit: null };
  return null;
}

const raw = JSON.parse(fs.readFileSync(infile, 'utf8'));
const normalized = raw.map(item => {
  const rankRaw = stripHtml(item.rank);
  const techniqueRaw = stripHtml(item.technique);
  const elementRaw = stripHtml(item.element);
  const prerequisiteRaw = stripHtml(item.prerequisite);
  const costRaw = stripHtml(item.cost);
  const descriptionRaw = stripHtml(item.description);

  return {
    ...item,
    rank_raw: rankRaw,
    rank: rankRaw || null,
    rank_arr: parseRank(rankRaw),
    technique_raw: techniqueRaw,
    technique: techniqueRaw || null,
    element_raw: elementRaw,
    element: parseElement(elementRaw),
    prerequisite_raw: prerequisiteRaw,
    prerequisite: prerequisiteRaw || null,
    cost_raw: costRaw,
    cost: costRaw || null,
    cost_parsed: parseCost(costRaw),
    description_raw: descriptionRaw,
    description: descriptionRaw || null,
  };
});

fs.writeFileSync(outfile, JSON.stringify(normalized, null, 2), 'utf8');
console.log('Wrote', normalized.length, 'normalized techniques to', outfile);