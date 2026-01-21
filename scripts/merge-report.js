
// Usage: node scripts/merge-report.js <outdir> <url> <domain> <jobId>
import fs from 'fs';
import path from 'path';
import { writeJSON, writeFile } from './utils.js';

const [,, outdir, url, domain, jobId] = process.argv;

const LH_DIR = path.join(outdir, 'lighthouse');
const LH_JSON = fs.readdirSync(LH_DIR).find(f => f.endsWith('.json'));
const LH_HTML = fs.readdirSync(LH_DIR).find(f => f.endsWith('.html'));

const lhData = JSON.parse(fs.readFileSync(path.join(LH_DIR, LH_JSON), 'utf-8'));
const seoData = JSON.parse(fs.readFileSync(path.join(outdir, 'seo.json'), 'utf-8'));
const linkData = JSON.parse(fs.readFileSync(path.join(outdir, 'links.json'), 'utf-8'));

const summary = {
  jobId, url, domain, createdAt: new Date().toISOString(),
  lighthouse: {
    performance: Math.round((lhData.categories.performance?.score || 0) * 100),
    accessibility: Math.round((lhData.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((lhData.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((lhData.categories.seo?.score || 0) * 100),
    htmlReport: 'lighthouse/' + LH_HTML,
    raw: 'lighthouse/' + LH_JSON
  },
  seo: seoData,
  links: linkData
};

writeJSON(path.join(outdir, 'report.json'), summary);

// صفحة index.html بسيطة للعرض
const indexHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>تقرير ${domain} - ${jobId}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,'Noto Sans',sans-serif;padding:24px;max-width:1000px;margin:auto;background:#0b1020;color:#e7eaf3}
.card{border:1px solid #1e284a;border-radius:12px;padding:16px;margin:16px 0;background:#121a33}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;color:#fff;margin-left:8px}
.badge.green{background:#16a34a}.badge.amber{background:#d97706}.badge.red{background:#dc2626}
a{color:#6366f1}
code{background:#0e152b;padding:2px 6px;border-radius:6px}
</style>
</head>
<body>
  <h1>تقرير الفحص</h1>
  <p><strong>الموقع:</strong> <a href="${url}" target="_blank">${url}</a></p>
  <p><strong>المهمة:</strong> ${jobId}</p>

  <div class="card">
    <h2>درجات Lighthouse</h2>
    <p>
      الأداء: <span class="badge ${scoreClass(${summary.lighthouse.performance})}">${summary.lighthouse.performance}</span>
      الوصولية: <span class="badge ${scoreClass(${summary.lighthouse.accessibility})}">${summary.lighthouse.accessibility}</span>
      أفضل الممارسات: <span class="badge ${scoreClass(${summary.lighthouse.bestPractices})}">${summary.lighthouse.bestPractices}</span>
      SEO: <span class="badge ${scoreClass(${summary.lighthouse.seo})}">${summary.lighthouse.seo}</span>
    </p>
    <p><a href="${summary.lighthouse.htmlReport}" target="_blank">عرض تقرير Lighthouse الكامل (HTML)</a></p>
  </div>

  <div class="card">
    <h2>ملخّص SEO</h2>
    <p><strong>Title:</strong> ${escapeHtml(summary.seo.title||'')}</p>
    <p><strong>Meta Description:</strong> ${escapeHtml(summary.seo.metaDesc||'')}</p>
    <p><strong>H1:</strong> ${escapeHtml(summary.seo.h1||'')}</p>
    <p><strong>Canonical:</strong> <code>${escapeHtml(summary.seo.canonical||'-')}</code></p>
    <p><strong>Robots:</strong> <code>${escapeHtml(summary.seo.robots||'-')}</code></p>
    <p><strong>صور بدون Alt:</strong> ${summary.seo.images?.missingAlt || 0}</p>
  </div>

  <div class="card">
    <h2>الروابط المكسورة</h2>
    <p><strong>إجمالي المفحوص:</strong> ${summary.links.scanned}</p>
    <p><strong>المكسور:</strong> ${summary.links.brokenCount}</p>
    <ul>
      ${summary.links.broken.slice(0,50).map(l=>`<li><code>${escapeHtml(l.url)}</code> — ${l.status}</li>`).join('')}
    </ul>
  </div>

  <p>JSON الكامل: <a href="./report.json" target="_blank">report.json</a></p>

<script>
function scoreClass(s){ if(s>=90) return 'green'; if(s>=50) return 'amber'; return 'red'; }
function escapeHtml(str){ return (str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#039;'}[m])); }
</script>
</body>
</html>`;
writeFile(path.join(outdir, 'index.html'), indexHtml);
