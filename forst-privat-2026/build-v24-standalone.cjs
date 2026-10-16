#!/usr/bin/env node
/* Build a single self-contained HTML file from the original V17 + V24 patch wrapper.
 * Historical originals are not modified. No network access is required at runtime. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname);
const base = fs.readFileSync(path.join(root, 'spiel-luxus-v17.html'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'spiel-luxus-v24.html'), 'utf8');
const start = loader.indexOf('const PATCHES=') + 'const PATCHES='.length;
const end = loader.indexOf('];\nasync function loadGame', start) + 1;
if (start < 15 || end < start) throw new Error('Could not locate V24 patches');
const patches = JSON.parse(loader.slice(start, end));
if (!Array.isArray(patches) || patches.length !== 32) throw new Error('Unexpected V24 patch count');
let output = base;
for (let i = patches.length - 1; i >= 0; --i) {
  const [pos, count, replacement] = patches[i];
  if (pos < 0 || pos + count > output.length) throw new Error('Invalid patch position ' + i);
  output = output.slice(0, pos) + replacement + output.slice(pos + count);
}
const after = loader.slice(loader.indexOf('async function loadGame(){'));
const matches = [...after.matchAll(/atob\('([A-Za-z0-9+/=]+)'\)/g)];
if (matches.length !== 2) throw new Error('Expected V21 and V23 embedded sections');
const v21 = Buffer.from(matches[0][1], 'base64').toString('utf8');
const v23 = Buffer.from(matches[1][1], 'base64').toString('latin1');
output = output.replace('</body>', v21 + '</body>');
output = output.replace('FIRE_AUDIO.volume=.75;', 'FIRE_AUDIO.volume=.34;');
output = output.replace('</body>', v23 + '</body>');
const marker = "game=game.replace('</body>',";
const p = after.lastIndexOf(marker);
if (p < 0) throw new Error('Missing V24 skins');
const begin = p + marker.length;
if (after[begin] !== '"') throw new Error('V24 literal is not quoted');
let i = begin + 1;
while (i < after.length) {
  if (after[i] === '\\') { i += 2; continue; }
  if (after[i] === '"') break;
  i++;
}
const v24 = JSON.parse(after.slice(begin, i + 1));
output = output.replace('</body>', v24 + '</body>');
output = output.replace(/<title>[^<]*<\/title>/, '<title>Der Forst der Finsternis – V24 Standalone</title>');
const nOpen = (output.match(/<script(?:\s|>)/gi) || []).length;
const nClose = (output.match(/<\/script>/gi) || []).length;
if (nOpen !== nClose || nOpen !== 4) throw new Error('Unbalanced script elements');
if (output.length < 5800000 || output.includes('const PATCHES=') || output.includes('spiel-luxus-v17.html')) throw new Error('Standalone validation failed');
if (!output.includes('id="v24-goldskin"') || !output.includes('id="v23polish"')) throw new Error('Missing latest UI layers');
const dest = path.join(root, 'spiel-luxus-v24-standalone.html');
fs.writeFileSync(dest, output, 'utf8');
console.log('Wrote', dest, 'chars:', output.length, 'scripts:', nOpen);
