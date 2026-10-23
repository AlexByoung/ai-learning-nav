// Temporary: run assets.mjs searches, keep a compact summary and small thumbnails to look at.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const queries = readFileSync('.taste-tools/queries.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
mkdirSync('.taste-tools/candidates', { recursive: true });
const summary = [];
for (const line of queries) {
  const video = line.startsWith('video:');
  const q = video ? line.slice(6).trim() : line;
  let out = '';
  try {
    out = execFileSync('node', ['.taste-tools/scripts/assets.mjs', q, '--limit', '6', '--no-check', '--json', ...(video ? ['--video'] : [])], { encoding: 'utf8', maxBuffer: 64e6, timeout: 240000 });
  } catch (e) { out = e.stdout || ''; }
  let items = [];
  try { items = JSON.parse(out).items ?? []; } catch {}
  let n = 0;
  for (const it of items) {
    const slug = `${q.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${n++}`;
    const rec = { query: q, slug, ref: it.ref, title: it.title, creator: it.creator, license: it.licenseLabel, w: it.width, h: it.height, page: it.page, media: it.media, duration: it.duration, credit: it.credit };
    summary.push(rec);
    let thumb = video ? it.poster : it.image;
    if (!thumb) continue;
    thumb = thumb.replace(/\/\d+px-/, '/480px-');
    try {
      const r = await fetch(thumb, { headers: { 'user-agent': 'ai-learning-nav-preview/1.0 (github.com/AlexByoung/ai-learning-nav)' }, signal: AbortSignal.timeout(30000) });
      if (r.ok) writeFileSync(`.taste-tools/candidates/${slug}.jpg`, Buffer.from(await r.arrayBuffer()));
      else rec.thumbError = r.status;
    } catch (e) { rec.thumbError = String(e.message); }
  }
}
writeFileSync('.taste-tools/candidates/summary.json', JSON.stringify(summary, null, 1));
console.log(summary.map((s) => `${s.slug} | ${s.license} | ${s.w}x${s.h} | ${s.title}`).join('\n'));
