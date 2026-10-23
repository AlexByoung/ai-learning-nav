// Temporary: fetch candidate pages from a CI runner and print status, title, keyword hits and YouTube links.
import { readFileSync } from 'node:fs';
const lines = readFileSync(process.argv[2], 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const pick = (re, s) => (s.match(re) || [])[1]?.replace(/\s+/g, ' ').trim();
for (const line of lines) {
  try {
    if (line.startsWith('oembed ')) {
      const target = line.slice(7);
      const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(target));
      const body = await r.text();
      let j = {};
      try { j = JSON.parse(body); } catch {}
      console.log(JSON.stringify({ oembed: target, status: r.status, title: j.title, author: j.author_name, author_url: j.author_url, raw: j.title ? undefined : body.slice(0, 200) }));
      continue;
    }
    if (line.startsWith('links ')) {
      const [url, re] = line.slice(6).split(' | ');
      const html = await (await fetch(url, { headers: { 'user-agent': UA } })).text();
      const out = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()]).filter(([h, t]) => new RegExp(re, 'i').test(h + ' ' + t));
      const checked = [];
      for (const [h, t] of out.slice(0, 12)) {
        const abs = new URL(h, url).href;
        let st = 'skip';
        try { const r = await fetch(abs, { headers: { 'user-agent': UA }, redirect: 'follow' }); st = r.status + ' ' + r.url + ' ' + (r.headers.get('content-type') || ''); } catch (e) { st = 'err ' + e.message; }
        checked.push({ text: t.slice(0, 60), href: abs, st });
      }
      console.log(JSON.stringify({ links: url, total: out.length, checked }));
      continue;
    }
    const [url, kws = ''] = line.split(' | ');
    const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' }, redirect: 'follow' });
    const html = await r.text();
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const hits = {};
    for (const k of kws.split(',').map((s) => s.trim()).filter(Boolean)) {
      const i = text.toLowerCase().indexOf(k.toLowerCase());
      hits[k] = i < 0 ? null : text.slice(Math.max(0, i - 80), i + 120);
    }
    const yt = [...new Set([...html.matchAll(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:playlist\?list=|watch\?v=|@|c\/|channel\/)[\w\-=&;@.]+|youtu\.be\/[\w\-]+)/g)].map((m) => m[0].replace(/&amp;/g, '&')))].slice(0, 20);
    console.log(JSON.stringify({ url, status: r.status, final: r.url, title: pick(/<title[^>]*>([^<]*)/i, html), og: pick(/property="og:title" content="([^"]*)"/i, html), yt, hits }));
  } catch (e) {
    console.log(JSON.stringify({ line, error: String(e.cause?.code || e.message) }));
  }
}
