// Temporary: fetch candidate pages from a CI runner and print status, title and YouTube links found.
import { readFileSync } from 'node:fs';
const urls = readFileSync(process.argv[2], 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const pick = (re, s) => (s.match(re) || [])[1]?.replace(/\s+/g, ' ').trim();
for (const url of urls) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' }, redirect: 'follow' });
    const html = await r.text();
    const title = pick(/<title[^>]*>([^<]*)/i, html);
    const og = pick(/property="og:title" content="([^"]*)"/i, html);
    const yt = [...new Set([...html.matchAll(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:playlist\?list=|watch\?v=|@|c\/|channel\/)[\w\-=&;@.]+|youtu\.be\/[\w\-]+)/g)].map((m) => m[0].replace(/&amp;/g, '&')))].slice(0, 15);
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 600);
    console.log(JSON.stringify({ url, status: r.status, final: r.url, title, og, yt, text }));
  } catch (e) {
    console.log(JSON.stringify({ url, error: String(e.cause?.code || e.message) }));
  }
}
