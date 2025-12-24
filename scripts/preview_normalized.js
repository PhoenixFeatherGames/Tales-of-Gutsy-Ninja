const fs = require('fs');
const path = require('path');
const infile = path.join(__dirname, '..', 'data', 'seeds', 'techniques.normalized.json');
const raw = JSON.parse(fs.readFileSync(infile, 'utf8'));
const preview = raw.slice(0, 10).map(t => ({ slug: t.slug, name: t.name, rank_arr: t.rank_arr, technique: t.technique, element: t.element, cost_parsed: t.cost_parsed }));
console.log(JSON.stringify(preview, null, 2));
