
// Usage: node scripts/check-links.js <url> <outFile>
import { writeJSON } from './utils.js';
import { LinkChecker } from 'linkinator';

const [,, url, outFile] = process.argv;
if (!url || !outFile) { console.error('Usage: node scripts/check-links.js <url> <outFile>'); process.exit(1); }

(async () => {
  const checker = new LinkChecker();
  const results = await checker.check({ path: url, recurse: true, maxDepth: 1, timeout: 15000 });

  const broken = results.links
    .filter(l => l.state === 'BROKEN')
    .map(l => ({ url: l.url, status: l.status }));

  writeJSON(outFile, { scanned: results.links.length, brokenCount: broken.length, broken });
})();
