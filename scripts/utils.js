
import fs from 'fs';
import path from 'path';

export function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
export function writeJSON(p, obj) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf-8');
}
export function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf-8');
}
