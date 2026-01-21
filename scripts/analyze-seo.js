
// Usage: node scripts/analyze-seo.js <url> <outFile>
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { writeJSON } from './utils.js';

const [,, url, outFile] = process.argv;
if (!url || !outFile) { console.error('Usage: node scripts/analyze-seo.js <url> <outFile>'); process.exit(1); }

const toAbs = (base, src) => { try { return new URL(src, base).href; } catch { return src || ''; } };

(async () => {
  const res = await fetch(url, { headers: { 'User-Agent': 'SEO-Auditor/1.0' }});
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = ($('title').first().text() || '').trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const h1 = $('h1').first().text().trim();
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const robots = $('meta[name="robots"]').attr('content') || '';
  const og = {
    title: $('meta[property="og:title"]').attr('content') || '',
    description: $('meta[property="og:description"]').attr('content') || '',
    url: $('meta[property="og:url"]').attr('content') || '',
    image: $('meta[property="og:image"]').attr('content') || ''
  };

  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = ($(el).attr('alt') || '').trim();
    images.push({ src: toAbs(url, src), hasAlt: alt.length > 0, alt });
  });
  const imagesMissingAlt = images.filter(i => !i.hasAlt);

  const links = [];
  $('a[href]').each((_, el) => links.push(toAbs(url, $(el).attr('href'))));

  writeJSON(outFile, {
    url, title, metaDesc, h1, canonical, robots, og,
    images: { total: images.length, missingAlt: imagesMissingAlt.length, samples: imagesMissingAlt.slice(0, 20) },
    linkCount: links.length
  });
})();
