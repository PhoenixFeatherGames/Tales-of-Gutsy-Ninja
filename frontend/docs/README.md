What's here
---------

- `docs/raw/` — paste or upload your original scroll/text files here.
- `docs/normalized/` — generated Markdown files after conversion.
- `data/seeds/` — generated JSON seed files for ingestion to Firestore.

How to use
----------

1. Drop your text files into `docs/raw/` (one file per topic: clan, village, rule, etc.)
2. Run:

```bash
npm run parse:scrolls
```

3. Review `docs/normalized/*.md` and `data/seeds/index.json`.

Custom markup supported
-----------------------

- `[b]...[/b]` -> bold
- `[i]...[/i]` -> italic
- `[s]...[/s]` -> strike-through
- `[c]...[/c]` -> centered paragraph
- `[|]` -> decorative scroll marker (converted to blockquote)

If you'd like, paste a file now and I'll ingest and convert it for you.
