// Creates one self-contained HTML file from the original Forst der Finsternis assets.
// Source versions remain immutable backups; no external V17 request at runtime.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const original = fs.readFileSync(path.join(root, 'spiel-luxus-v17.html'), 'utf8');
const wrapper = fs.readFileSync(path.join(root, 'spiel-luxus-v25-final.html'), 'utf8');
const begin = wrapper.indexOf('const BASE_URL=');
const end = wrapper.lastIndexOf('</script>');
if (begin < 0 || end <= begin) throw new Error('V25 source structure changed');
let generated = null;
const err = { textContent: '' };
const doc = {
  frame: null,
  body: { appendChild(el) { doc.frame = el; } },
  createElement(name) { if (name !== 'iframe') throw new Error('Unexpected element: ' + name); return { style: {}, srcdoc: '' }; },
  querySelector() { return { remove() {} }; },
  getElementById() { return err; }
};
const context = vm.createContext({
  document: doc,
  fetch: async () => ({ ok: true, text: async () => original }),
  TextDecoder, Uint8Array, atob, console, setTimeout, clearTimeout
});
(async () => {
  await vm.runInContext(wrapper.slice(begin, end) + '\nloadGame();', context, { timeout: 120000, filename: 'v25-bundle.js' });
  generated = doc.frame?.srcdoc;
  if (!generated || generated.length < original.length) throw new Error('Failed to assemble V25: ' + err.textContent);
  // srcdoc used the parent hash; a standalone page uses its own address.
  generated = generated.replaceAll('parent.location.hash.slice(1)', 'location.hash.slice(1)');
  if (generated.includes('raw.githack.com/Stevenr105/Steve/master/forst-privat-2026/spiel-luxus-v17.html')) throw new Error('External dependency remained');
  const scripts = generated.split('<script>').slice(1).map(s => [null, s.split('</script>')[0]]);
  if (scripts.length < 4) throw new Error('Expected script blocks not found');
  for (const [, source] of scripts) new vm.Script(source);
  const output = path.join(root, 'dist');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'index.html'), generated, 'utf8');
  console.log('Generated one standalone HTML file:', Buffer.byteLength(generated, 'utf8'), 'bytes;', scripts.length, 'script blocks checked');
})().catch(err => { console.error(err); process.exitCode = 1; });
