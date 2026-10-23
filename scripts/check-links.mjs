#!/usr/bin/env node
// Check every URL in src/data/courses.yaml.
//
//   npm run check-links                       # uses lychee if installed, otherwise a built-in Node checker
//   npm run check-links -- --node             # force the built-in checker
//   npm run check-links -- --report out.md    # also write a Markdown report
//
// Exit code is non-zero when any link is broken.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const DATA = 'src/data/courses.yaml';
const args = process.argv.slice(2);
const reportPath = args.includes('--report') ? args[args.indexOf('--report') + 1] : null;
const forceNode = args.includes('--node');
const lycheeBin = process.env.LYCHEE_BIN || 'lychee';

const hasLychee = !forceNode && spawnSync(lycheeBin, ['--version'], { stdio: 'ignore' }).status === 0;

if (hasLychee) {
  console.log(`Checking links in ${DATA} with lychee…`);
  const lycheeArgs = ['--config', 'lychee.toml'];
  if (reportPath) lycheeArgs.push('--format', 'markdown', '--output', reportPath);
  const res = spawnSync(lycheeBin, [...lycheeArgs, DATA], { cwd: root, stdio: 'inherit' });
  process.exit(res.status ?? 1);
}

// ---- Built-in fallback (no extra dependencies) ----
console.log(`lychee not found, using built-in checker for ${DATA}.`);
console.log('Tip: behind an HTTPS proxy run with NODE_USE_ENV_PROXY=1 (Node >= 22.21).\n');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const source = readFileSync(new URL(`../${DATA}`, import.meta.url), 'utf8');
const urls = [...new Set(source.match(/https?:\/\/[^\s"'<>]+/g) ?? [])];

async function check(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(30_000),
    });
    res.body?.cancel();
    const ok = (res.status >= 200 && res.status < 300) || res.status === 429;
    if (!ok && attempt < 3) return check(url, attempt + 1);
    return { url, ok, status: String(res.status) };
  } catch (err) {
    if (attempt < 3) return check(url, attempt + 1);
    return { url, ok: false, status: err?.cause?.code ?? err?.name ?? 'ERROR' };
  }
}

const results = await Promise.all(urls.map((u) => check(u)));
for (const r of results) console.log(`${r.ok ? '✔' : '✘'} [${r.status}] ${r.url}`);
const broken = results.filter((r) => !r.ok);
console.log(`\n${urls.length} links, ${urls.length - broken.length} OK, ${broken.length} broken.`);

if (reportPath) {
  const lines = ['# Link check report', '', `${urls.length} links, ${broken.length} broken.`, ''];
  for (const r of broken) lines.push(`- [${r.status}] <${r.url}>`);
  writeFileSync(reportPath, `${lines.join('\n')}\n`);
}
process.exit(broken.length ? 1 : 0);
