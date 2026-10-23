#!/usr/bin/env node
// Request the deployed pages and every same-site asset they reference (CSS, JS, fonts, images);
// exit non-zero if anything is not HTTP 200.
//
//   node scripts/smoke-test.mjs https://alexbyoung.github.io/ai-learning-nav/
//   node scripts/smoke-test.mjs http://localhost:4321/ai-learning-nav/
const base = new URL(process.argv[2] ?? 'https://alexbyoung.github.io/ai-learning-nav/');
const pages = ['', 'courses/', 'paths/', 'paths/agent-user-to-internals/'];

const results = [];
const assets = new Set();

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30_000) });
      return res;
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

for (const path of pages) {
  const url = new URL(path, base).href;
  const res = await get(url);
  const html = await res.text();
  results.push({ url, status: res.status, kind: 'page' });
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const abs = new URL(ref, url);
    if (abs.origin === base.origin && abs.pathname.startsWith(base.pathname) && !abs.pathname.endsWith('/')) {
      assets.add(abs.href);
    }
  }
}

// CSS can pull in fonts; follow url(...) one level deep.
for (const css of [...assets].filter((a) => a.endsWith('.css'))) {
  const text = await (await get(css)).text();
  for (const [, ref] of text.matchAll(/url\(([^)]+)\)/g)) {
    const abs = new URL(ref.replace(/['"]/g, ''), css);
    if (abs.origin === base.origin) assets.add(abs.href);
  }
}

for (const url of assets) {
  const res = await get(url);
  await res.arrayBuffer();
  results.push({ url, status: res.status, kind: 'asset' });
}

for (const r of results) console.log(`${r.status === 200 ? '✔' : '✘'} ${r.status} ${r.kind.padEnd(5)} ${r.url}`);
const bad = results.filter((r) => r.status !== 200);
console.log(`\n${results.filter((r) => r.kind === 'page').length} pages, ${assets.size} assets, ${bad.length} not 200.`);
process.exit(bad.length ? 1 : 0);
